import { QuickReplyItem } from "chat-list/types/message";
import { ChatPluginBase, IChatPlugin } from "chat-list/types/plugin";
import introduce from './promps/introduce.slide.md';
import React from "react";
import instruction from './promps/instruction.slide.md';
import CoderRender from 'chat-list/components/render-coder';
import description from './promps/description.slide.md';
import i18n from 'chat-list/locales/i18n';
import GSPng from 'chat-list/assets/img/gs-32.png';

/**
 * Code generation and run it in Google Apps Script
 */
export class Code extends ChatPluginBase implements IChatPlugin {
  name = i18n.t('sheet.agent.coder', 'Coder');
  icon = GSPng;
  // model = null;
  action = "coder";
  placeholder = "Tell me your tasks";
  shortDescription = i18n.t('sheet.agent.coder.short_description', "Code generation and run it in Google Apps Script.");
  description = description;
  instruction = instruction;
  introduce = introduce;
  quickReplies = (input: string) => {
    return [{
      code: 'editor',
      name: 'Editor'
    }] as QuickReplyItem[];
  };
  onQuickReply = (quickReply: QuickReplyItem) => {
    const context = this.context;
    if (quickReply.code == 'editor') {
      context.setMode(this.action, 'custom');
    }
  };
  tools = ['code_interpreter'];
  render = () => {
    return (
      <CoderRender />
    );
  };
}

export default new Code();
