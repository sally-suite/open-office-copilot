import { QuickReplyItem } from "chat-list/types/message";
import { ChatPluginBase, IChatPlugin } from "chat-list/types/plugin";
import { IChatMessage } from "chat-list/types/message";
import React from "react";
import { buildCreateTaskPrompt, parseTaskList } from "./util";
import { ITask } from "chat-list/types/task";
import CardTaskList from 'chat-list/components/card-tasks/plan-tasks';
import CardProgress from 'chat-list/components/card-tasks/progress';
import { shortTermMemory } from 'chat-list/utils/chat';
import { Waypoints } from "lucide-react";
import introduce from './promps/introduce.md';
import CardConfirm from 'chat-list/components/card-confirm';
import instruction from './promps/instruction.md';
import FlowRender from 'chat-list/components/render-planner';
import AgentSelector from 'chat-list/components/agent-selector';
/**
 * Main service, task split ,plan
 */
export class Main extends ChatPluginBase implements IChatPlugin {
  onQuickReply: (quickReply: QuickReplyItem) => void;
  name = "Planner";
  icon = Waypoints;
  // model = null;
  action = "planner";
  placeholder = "Tell me your tasks";
  description = instruction;
  shortDescription = "Split task and execute a series of tasks.";
  instruction = instruction;
  introduce = introduce;
  mode = 'custom';
  colAgents: IChatPlugin[] = [];
  quickReplies = () => {
    return [{
      element: <AgentSelector onChange={(agents: IChatPlugin[]) => {
        this.colAgents = agents;
      }} />,
    }];
    // return [] as QuickReplyItem[];
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
  };
  updateTaskStatus = async (id: number, status: ITask['status']) => {
    const task = this.taskList.find(t => t.id === id);
    if (task) {
      task.status = status;
      // this.sendMsg(this.buildChatMessage(<CardProgress tasks={this.taskList} />, 'card'));
    }
  };
  confirmTasks = async (tasks: ITask[], input: string) => {
    this.context.appendMsg(this.buildChatMessage(
      <CardTaskList
        plan={input}
        tasks={tasks}
      />, 'card'
    ));
  };
  onReceive = async (message: IChatMessage) => {
    const { content: input } = message;
    const plugins = this.colAgents;
    shortTermMemory.clear();
    shortTermMemory.push(buildCreateTaskPrompt(input as string, plugins));
    const { content } = await this.context.chat({ messages: shortTermMemory.list(), temperature: 0.8 });
    const tasks = parseTaskList(content);
    await this.confirmTasks(tasks, input);
    return;
  };
  render = () => {
    return <FlowRender />;
  };
}

export default new Main();
