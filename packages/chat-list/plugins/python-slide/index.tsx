import { QuickReplyItem } from "chat-list/types/message";
import { ChatPluginBase, IChatPlugin } from "chat-list/types/plugin";
import { IChatMessage } from "chat-list/types/message";
import instruction from './promps/instruction.md';
import description from './promps/description.md';
import i18n from 'chat-list/locales/i18n';
import { initEnv } from "chat-list/tools/sheet/python/util";
import avatarPng from 'chat-list/assets/img/python-32.png';
import ContextSlide from "chat-list/components/context-slide";
import React from "react";

/**
 * Code generation and run it in Google Apps Script
 */
export class Code extends ChatPluginBase implements IChatPlugin {
  name = 'Python';
  icon = avatarPng;
  // model = null;
  action = "python-slide";
  placeholder = i18n.t('agent:python-slide_placeholder', "Please enter your slide requirements");
  shortDescription = "Generate python code to create Powerpoint.";
  description = description;
  instruction = instruction;
  // introduce = introduce;
  introduce = () => {
    return i18n.t('agent:python-slide_introduction', "Hi! How can I assist you today?");
  };
  fileConfig = {
    accept: {
      text: false,
      xlsx: true
    },
    maxSize: 99999999,
    maxFiles: 1,
    multiple: false
  };
  quickReplies = () => {
    // return [{
    //   code: 'editor',
    //   name: 'Editor'
    // }] as QuickReplyItem[];
    return [];
  };
  onQuickReply = (quickReply: QuickReplyItem) => {
    const context = this.context;
    if (quickReply.code == 'editor') {
      context.setMode(this.action, 'custom');
    }
  };
  tools = ['pip_install', 'python_interpreter_slide'];
  renderMessageContext = (context: string) => {
    const data = JSON.parse(context);
    return (
      <ContextSlide type={data.type} text={data.text} slides={data.slides} />
    );
  };
  initialize = false;
  async onReceive(message: IChatMessage, options?: { stream: boolean; }): Promise<any> {
    const { showMessage } = this.context;
    if (!this.initialize) {
      const toolMsg = showMessage(i18n.t('python:init_env', 'Initializing Python environment.Please wait a moment.'));
      await initEnv(['python-pptx']);
      toolMsg.succeeded(i18n.t('python:init_env_success', 'Python environment initialization completed.'));
      this.initialize = true;
    }

    return await super.onReceive(message, options);
  }
}

export default new Code();
