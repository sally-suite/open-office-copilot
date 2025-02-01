import { QuickReplyItem } from "chat-list/types/message";
import { ChatPluginBase, IChatPlugin } from "chat-list/types/plugin";
import { IChatMessage } from "chat-list/types/message";
import React from "react";
import { buildCreateTaskPrompt, parseNextTask, parseTaskList, parseTaskResult } from "./util";
import { ITask } from "chat-list/types/task";
import CardTaskList from 'chat-list/components/card-tasks/list'
import CardProgress from 'chat-list/components/card-tasks/progress'
import { SHEET_CHAT_TASK_AUTO_EXEC } from "chat-list/config/task";
import { getLocalStore } from "chat-list/local/local";
import { shortTermMemory } from 'chat-list/utils/chat'
import { Waypoints } from "lucide-react";
import introduce from './promps/introduce.md'
import CardConfirm from 'chat-list/components/card-confirm'
import { getHeaderList } from 'chat-list/service/sheet'
import instruction from './promps/instruction.md';
import FlowRender from '../../components/render-planner'
/**
 * Main service, task split ,plan
 */
export class Main extends ChatPluginBase implements IChatPlugin {
  onQuickReply: (quickReply: QuickReplyItem) => void;
  name = "Flow";
  icon = Waypoints;
  // model = null;
  action = "flow";
  placeholder = "Tell me your tasks";
  description = instruction;
  shortDescription = "Split task and execute a series of tasks.";
  instruction = instruction;
  introduce = introduce;
  mode = 'custom';
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
  retries: any = {};
  reset() {
    this.currentTask = null;
    shortTermMemory.clear();
    this.taskList = [];
    this.step = 0;
    this.retries = {};
  };
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
            this.currentTask = null;
            shortTermMemory.clear();
            this.taskList = [];
            this.step = 0;
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
      this.sendMsg(this.buildChatMessage(<CardProgress tasks={this.taskList} />, 'card'));
      this.sendMsg(this.buildChatMessage('All tasks have been completed', 'text'));

      this.currentTask = null;
      shortTermMemory.clear();
      this.taskList = [];
      this.step = 0;
      this.context.setTyping(false);
    }
  }
  updateTaskStatus = async (id: number, status: ITask['status']) => {
    const task = this.taskList.find(t => t.id === id);
    if (task) {
      task.status = status;
      // this.sendMsg(this.buildChatMessage(<CardProgress tasks={this.taskList} />, 'card'));
    }
  }
  confirmTasks = async (tasks: ITask[]) => {
    const auto = getLocalStore(SHEET_CHAT_TASK_AUTO_EXEC);
    if (auto == 'auto') {
      this.round = tasks.length + 1;
      this.context.appendMsg(this.buildChatMessage(<CardTaskList
        tasks={tasks}
      />, 'card'))
      // shortTermMemory.push({
      //   role: 'user',
      //   content: `Only need to excute tasks :\n ${JSON.stringify(tasks, null, 2)}`
      // });
      this.taskList = tasks;
      const task = parseNextTask(tasks);
      this.nextTask(task);
    } else {
      this.context.appendMsg(this.buildChatMessage(<CardTaskList
        tasks={tasks}
        onConfirm={(tasks) => {
          // this.taskList = tasks;
          this.round = tasks.length + 1;
          // shortTermMemory.clear();
          // const requirements = tasks.map(t => t.task).join(';');
          // shortTermMemory.push(buildCreateTaskPrompt(requirements as string, this.context.plugins));
          // shortTermMemory.push({
          //   role: 'user',
          //   content: `Only need to excute tasks :\n ${JSON.stringify(tasks, null, 2)}`
          // });
          this.taskList = tasks;
          const task = parseNextTask(tasks);

          this.nextTask(task);
        }}
      />, 'card'))
    }
  }
  onReceive = async (message: IChatMessage) => {
    const { content: input, role, from } = message;
    const plugins = this.context.plugins || [];

    if (!role || role == 'user' || from?.name == 'sally') {
      // receive use info
      shortTermMemory.clear();
      const columns = await getHeaderList();
      shortTermMemory.push(buildCreateTaskPrompt(input as string, columns, plugins));
      const { content } = await this.context.chat({ messages: shortTermMemory.list(), temperature: 0.8 });
      const tasks = parseTaskList(content);
      await this.confirmTasks(tasks);
    } else if (role === 'assistant') {
      if (input && this.currentTask) {
        const result = parseTaskResult(input);
        if (result.status == 'successfully') {
          this.updateTaskStatus(this.currentTask.id, 'done')
          // shortTermMemory.push({
          //   role: 'user',
          //   content: `Execute task ${this.currentTask.id}:${this.currentTask.task} ${result.status}, the task is done.` + ((result.result ? `the task result is ${result.result}` : '') + ', return new task list.')
          // });
          const task = parseNextTask(this.taskList);
          this.nextTask(task);
        } else {
          this.updateTaskStatus(this.currentTask.id, 'failed')
          // shortTermMemory.push({
          //   role: 'user',
          //   content: `Execute task ${this.currentTask.id}:${this.currentTask.task}, the task executed failed, reason is ${result.reason}.`
          // });
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
        // this.sendMsg(this.buildChatMessage(<CardProgress tasks={tasks} />, 'card'));
        // const task = parseNextTask(tasks);

      }
    }
    return;
  };
  render = () => {
    return <FlowRender />
  }
}

export default new Main();
