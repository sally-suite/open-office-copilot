import { QuickReplyItem } from "chat-list/types/message";
import { ChatPluginBase, IChatPlugin } from "chat-list/types/plugin";
import { IChatMessage } from "chat-list/types/message";
import React from "react";
import { buildCreateTaskPrompt, parseNextTask, parseTaskList, parseTaskResult } from "./util";
import { ITask } from "chat-list/types/task";
import CardTaskList from 'chat-list/components/card-tasks/list'
// import CardProgress from 'chat-list/components/card-tasks/progress'
import { SHEET_CHAT_TASK_AUTO_EXEC } from "chat-list/config/task";
import { getLocalStore } from "chat-list/local/local";
// import { shortTermMemory } from 'chat-list/utils/chat'
import { Glasses } from "lucide-react";
import introduce from './promps/introduce.md'
import CardConfirm from 'chat-list/components/card-confirm'
import analyzSummary from './promps/analyz-summary.md'
import { arrayToMarkdownTable } from "chat-list/utils";
import { getValues } from 'chat-list/service/sheet';
import instruction from './promps/instruction.md';

/**
 * Main service, task split ,plan
 */
export class Analyst extends ChatPluginBase implements IChatPlugin {
  name = "Data Analyst";
  icon = Glasses;
  // model = null;
  action = "analyst";
  placeholder = "This sheet data is about...and I want to analyze...";
  description = "Plan and execute data analysis tasks.";
  instruction = instruction;
  introduce = introduce;
  quickReplies = (input: string) => {
    return [] as QuickReplyItem[];
  };
  onSend = (input: IChatMessage) => {
    // 用户发送的消息，拦截，自定义一些操作
    return input;
  };
  // conversationMemory: IMessageBody[] = [];
  currentTask: ITask;
  taskList: ITask[] = [];
  step = 0;
  round = 10;
  dateset: string;
  retries: any = {};
  reset() {
    this.currentTask = null;
    // this.shortTermMemory = [];
    this.taskList = [];
    this.step = 0;
    this.dateset = '';
    this.retries = {};
  };
  getDataByMarkdown = async () => {
    const values = await getValues();
    return arrayToMarkdownTable(values);
  }
  nextTask = async (task: ITask) => {
    if (task) {
      if (this.step > this.round) {
        this.sendMsg(this.buildChatMessage(<CardConfirm
          title="Task Status Confirmation"
          content={`This task has executed over ${this.round} rounds. Please confirm whether to continue?`}
          onOk={() => {
            this.step = 0;
            this.currentTask = task;
            console.log('exec task', this.currentTask.skill, this.currentTask.task);
            const newMsg = this.buildChatMessage(this.currentTask.task, 'text', this.currentTask.skill);
            this.sendMsg(newMsg);
          }}
          onCancel={() => {
            this.reset();
            this.sendMsg(this.buildChatMessage('Ok, Task Cancelled', 'text'));
            this.context.setTyping(false);
          }}
        />, 'card', ''));
        return;
      }
      this.step++;
      this.currentTask = task;
      console.log('exec task', this.currentTask.skill, this.currentTask.task);
      const newMsg = this.buildChatMessage(this.currentTask.task, 'text', this.currentTask.skill);
      this.sendMsg(newMsg);
    } else {
      this.shortTermMemory.push({
        role: 'user',
        content: analyzSummary
      })
      this.context.appendMsg(this.buildChatMessage(`All tasks have been completed, I'll summarize a data analysis for you`, 'text'));
      setTimeout(async () => {
        this.context.setTyping(true);
        const { content } = await this.context.chat({ messages: this.shortTermMemory, temperature: 0.8 });
        this.shortTermMemory.push({
          role: 'assistant',
          content: content
        });
        this.sendMsg(this.buildChatMessage(content, 'text'));
        const askQuestMsg = `You can ask me questions about this data analysis report, Or clean messages and start another analyze task.`;
        this.sendMsg(this.buildChatMessage(askQuestMsg, 'text'))
        this.shortTermMemory.push({
          role: 'assistant',
          content: askQuestMsg
        })
        this.reset();
        this.context.setTyping(false);
      }, 0);
    }
  }
  updateTaskStatus = async (id: number, status: ITask['status']) => {
    const task = this.taskList.find(t => t.id === id);
    if (task) {
      task.status = status;
      // this.sendMsg(this.buildChatMessage(<CardProgress tasks={this.taskList} />, 'card'));
    }
  }
  confirmTasks = async (tasks: ITask[], plugins: IChatPlugin[]) => {
    const auto = getLocalStore(SHEET_CHAT_TASK_AUTO_EXEC);
    if (auto == 'auto') {
      this.round = tasks.length + 1;
      this.context.appendMsg(this.buildChatMessage(<CardTaskList
        tasks={tasks}
      />, 'card'))
      this.shortTermMemory.push({
        role: 'user',
        content: `Excute tasks :\n ${JSON.stringify(tasks, null, 2)}`
      });
      this.taskList = tasks;
      const task = parseNextTask(tasks);
      this.nextTask(task);
    } else {
      this.context.appendMsg(this.buildChatMessage(<CardTaskList
        tasks={tasks}
        onConfirm={async (tasks) => {
          this.taskList = tasks;
          this.round = tasks.length + 1;
          this.shortTermMemory = [];
          if (!this.dateset) {
            this.dateset = await this.getDataByMarkdown();
          }
          const requirements = tasks.map(t => t.task).join(';');
          this.shortTermMemory.push(buildCreateTaskPrompt(requirements as string, this.dateset, plugins));
          this.shortTermMemory.push({
            role: 'user',
            content: `Excute tasks :\n ${JSON.stringify(tasks, null, 2)}`
          });
          const task = parseNextTask(tasks);

          this.nextTask(task);
        }}
      />, 'card'))
    }
  }
  onReceive = async (message: IChatMessage) => {
    const { content: input, role } = message;
    const include = ['coder', 'chart', 'chatsheet', 'calculator', 'filter'];
    const plugins = (this.context.plugins || []).filter(p => include.includes(p.action));

    if (!role || role == 'user' || message?.from.name == 'sally') {
      // receive use info
      if (this.shortTermMemory.length > 0) {
        this.shortTermMemory.push({
          role: 'user',
          content: message.content
        })
        const { content } = await this.context.chat({ messages: this.shortTermMemory, temperature: 0.8 });
        this.shortTermMemory.push({
          role: 'assistant',
          content: content
        })
        this.sendMsg(this.buildChatMessage(content, 'text'));
      } else {
        this.dateset = await this.getDataByMarkdown();
        const systemContext = buildCreateTaskPrompt(input as string, this.dateset, plugins)
        this.shortTermMemory = []
        this.shortTermMemory.push(systemContext);
        const { content } = await this.context.chat({ messages: this.shortTermMemory, temperature: 0.8 });
        const tasks = parseTaskList(content);
        await this.confirmTasks(tasks, plugins);
      }

    } else if (role === 'assistant') {
      if (input && this.currentTask) {
        const result = parseTaskResult(input);
        if (result.status == 'successfully') {
          this.updateTaskStatus(this.currentTask.id, 'done')
          this.shortTermMemory.push({
            role: 'user',
            content: `Task ${this.currentTask.id} is done.` + ((result.result ? `the task result is ${result.result}` : '') + ', return new task list in JSON format that is delimited by triple backticks')
          });
          const task = parseNextTask(this.taskList);
          this.nextTask(task);
        } else {
          this.updateTaskStatus(this.currentTask.id, 'failed')
          this.shortTermMemory.push({
            role: 'user',
            content: `Task ${this.currentTask.id} executed failed, reason is ${result.reason}.`
          });

          if (!this.retries[this.currentTask.id]) {
            this.retries[this.currentTask.id] = 0;
          }
          this.retries[this.currentTask.id]++;

          if (this.retries[this.currentTask.id] <= 1) {
            this.nextTask(this.currentTask);
          } else {
            const task = parseNextTask(this.taskList);
            this.nextTask(task);
          }
        }
        // const { content } = await this.context.chat({ messages: shortTermMemory.list(), temperature: 0.8 });
        // shortTermMemory.push({
        //   role: 'assistant',
        //   content
        // });
        // const tasks = parseTaskList(content);
        // if (tasks.length > 0) {
        //   this.sendMsg(this.buildChatMessage(<CardProgress tasks={tasks} />, 'card'));
        //   const task = parseNextTask(tasks);
        //   this.nextTask(task);
        // } else {
        //   this.nextTask(null);
        // }
      }
    }
    return;
  };
}

export default new Analyst();
