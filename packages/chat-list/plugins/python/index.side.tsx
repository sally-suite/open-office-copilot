import { ChatPluginBase, IChatPlugin } from "chat-list/types/plugin";
import { IChatMessage } from "chat-list/types/message";
import introduce from './promps/introduce.md'
import React from "react";
import instruction from './promps/instruction.md';
import PythonRender from 'chat-list/components/render-python';
// import { tools } from 'chat-list/tools/sheet/coder';
import { getSheetInfo } from "chat-list/service/sheet";
import description from './promps/description.md';
import i18n from 'chat-list/locales/i18n';
import { initEnv } from "chat-list/tools/sheet/python/util";
import avatarPng from 'chat-list/assets/img/python-32.png';

/**
 * Code generation and run it in Google Apps Script
 */
export class Code extends ChatPluginBase implements IChatPlugin {
  name = i18n.t('sheet.agent.python', 'Python')
  icon = avatarPng;
  // model = null;
  action = "python";
  placeholder = i18n.t('sheet.agent.sally.placeholder', "Chat with me Or @ agent to help you.");
  shortDescription = i18n.t('sheet.agent.python.short_description', "Generate python code and run it to edit data or generate charts.");
  description = description;
  instruction = instruction;
  introduce = introduce;
  fileConfig = {
    accept: {
      text: false,
      xlsx: true
    },
    maxSize: 2048000,
    maxFiles: 1,
    multiple: false
  };
  // quickReplies = () => {
  //   return [{
  //     code: 'editor',
  //     name: 'Editor'
  //   }] as QuickReplyItem[];
  // };
  // onQuickReply = (quickReply: QuickReplyItem) => {
  //   // const context = this.context;
  //   // if (quickReply.code == 'editor') {
  //   //   context.setMode('custom');
  //   // }
  // }
  onSend = (input: IChatMessage) => {
    // 用户发送的消息，拦截，自定义一些操作
    return input;
  };
  tools = ['pip_install', 'python_interpreter'];
  agents = ['analyst'];
  injectContext = async () => {
    return await getSheetInfo()
  }
  initialize = false
  async onReceive(message: IChatMessage, options?: { stream: boolean; }): Promise<any> {
    const { showMessage } = this.context;
    const { type, files } = message;
    if (type == 'parts') {
      window.INPUT_EXCEL_FILE = files[0]
    }
    if (!this.initialize) {
      const toolMsg = showMessage(i18n.t('python:init_env', 'Initializing Python environment.Please wait a moment.'));
      await initEnv();
      toolMsg.succeeded(i18n.t('python:init_env_success', 'Python environment initialization completed.'));
      this.initialize = true;
    }

    return await super.onReceive(message, options)
  }
  render = () => {
    return (
      <PythonRender />
    )
  }
}

export default new Code();
