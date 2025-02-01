import { QuickReplyItem } from "chat-list/types/message";
import { ChatPluginBase, IChatPlugin } from "chat-list/types/plugin";
import { IChatMessage } from "chat-list/types/message";
import React from "react";
import instruction from './promps/instruction.md';
import PythonRender from 'chat-list/components/render-python';
// import { tools } from 'chat-list/tools/sheet/coder';
import description from './promps/description.md';
import i18n from 'chat-list/locales/i18n';
import { initEnv, prepareFolder } from "chat-list/tools/sheet/python/util";
import avatarPng from 'chat-list/assets/img/bar-chart.png'
import { dataRangeAnalyzeMixin } from '../_mixins/sheet';
import ContextSheet from "chat-list/components/context-sheet";
import { ISheetInfo } from "chat-list/types/api/sheet";

/**
 * Code generation and run it in Google Apps Script
 */
export class Code extends ChatPluginBase implements IChatPlugin {
  name = i18n.t('sheet.agent.python', 'Python')
  icon = avatarPng;
  // model = null;
  action = "python";
  placeholder = i18n.t('agent:python_placeholder', 'Input your data analysis request');
  shortDescription = i18n.t('sheet.agent.python.short_description', "Generate python code and run it to edit data or generate charts.");
  description = description;
  instruction = instruction;
  introduce = i18n.t('agent:python_introduction', "How can I assist you today?");
  fileConfig = {
    accept: {
      text: false,
      xlsx: false
    },
    maxSize: 9999,
    maxFiles: 1,
    multiple: false
  };
  quickReplies = () => {
    // return [{
    //   code: 'editor',
    //   name: 'Editor'
    // }] as QuickReplyItem[];
    return []
  };
  onQuickReply = (quickReply: QuickReplyItem) => {
    // const { appendMsg } = this.context;
    // if (quickReply.code == 'editor') {
    //   context.setMode('custom');
    // }
    // appendMsg(buildChatMessage(<CardConfirm content="" okText={"Confirm"} cancelText="Reselect and Confirm" />, 'card', 'user'))
  }
  onSend = (input: IChatMessage) => {
    // 用户发送的消息，拦截，自定义一些操作
    return input;
  };
  tools = ['pip_install', 'python_interpreter'];
  // agents = [];
  // injectContext = async () => {
  //   return await getSheetInfo()
  // }
  initialize = false
  // async onReceive(message: IChatMessage, options?: { stream: boolean; }): Promise<any> {
  //   const { showMessage } = this.context;
  //   if (!this.initialize) {
  //     const toolMsg = showMessage(i18n.t('python:init_env', 'Initializing Python environment.Please wait a moment.'));
  //     await initEnv();
  //     toolMsg.succeeded(i18n.t('python:init_env_success', 'Python environment initialization completed.'));
  //     this.initialize = true;
  //   }

  //   return await super.onReceive(message, options)
  // }
  // analyzeDataRange: (content: string) => Promise<void>;
  // showSheetInfo: (message: IChatMessage) => void;
  renderMessageContext = (context: string) => {
    const sheetInfo: ISheetInfo = JSON.parse(context);
    return (
      <ContextSheet address={sheetInfo.activeRange} />
    )
  }
  onReceive = async (message: IChatMessage) => {
    const { setTyping } = this.context;
    if (!message.content) {
      return;
    }
    setTyping(true);
    const { showMessage } = this.context;
    if (!this.initialize) {
      const toolMsg = showMessage(i18n.t('python:init_env', 'Initializing Python environment.Please wait a moment.'));
      await initEnv();
      toolMsg.succeeded(i18n.t('python:init_env_success', 'Python environment initialization completed.'));
      this.initialize = true;
    }

    if (message.mentions.length == 0 && this.memory.length == 0) {
      setTyping(true);
      await prepareFolder(['/output'], true);
      await (this as any).showSheetInfo(message);
      return;
    }
    return await super.onReceive(message);
    // return await super.handleByReact(message, { stream: false });
  }
  render = () => {
    return (
      <PythonRender />
    )
  }
}

export default new Code(dataRangeAnalyzeMixin);
