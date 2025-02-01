import { QuickReplyItem } from "chat-list/types/message";
import { ChatPluginBase, IChatPlugin } from "chat-list/types/plugin";
import { IChatMessage } from "chat-list/types/message";
import React from "react";
import instruction from './promps/instruction.md';
import CoderRender from 'chat-list/components/render-coder';
// import { tools } from 'chat-list/tools/sheet/coder';
import { getSheetInfo } from "chat-list/service/sheet";
import description from './promps/description.md';
import i18n from 'chat-list/locales/i18n';
import GSPng from 'chat-list/assets/img/gs-32.png';
import { dataRangeAnalyzeMixin } from '../_mixins/sheet';
import { ISheetInfo } from "chat-list/types/api/sheet";
import ContextSheet from "chat-list/components/context-sheet";

/**
 * Code generation and run it in Google Apps Script
 */
export class Code extends ChatPluginBase implements IChatPlugin {
  name = i18n.t('sheet.agent.coder', 'Coder');
  icon = GSPng;
  // model = null;
  action = "coder";
  placeholder = i18n.t('agent:coder_placeholder', "Enter your sheet editing requirements");
  shortDescription = i18n.t('sheet.agent.coder.short_description', "Code generation and run it in Google Apps Script.");
  description = description;
  instruction = instruction;
  introduce = i18n.t('agent:coder_introduction', "Hi!How can I assist you today?");
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
  renderMessageContext = (context: string) => {
    const sheetInfo: ISheetInfo = JSON.parse(context);
    return (
      <ContextSheet address={sheetInfo.activeRange} />
    );
  };
  analyzeDataRange: (content: string) => Promise<void>;
  showSheetInfo: (message: IChatMessage) => void;
  // onReceive = async (message: IChatMessage) => {
  //   const { setTyping } = this.context;
  //   if (!message.content) {
  //     return;
  //   }
  //   setTyping(true);
  //   if (message.mentions.length == 0 && this.memory.length == 0) {
  //     setTyping(true);
  //     await this.showSheetInfo(message);
  //     return;
  //   }
  //   return await super.onReceive(message)
  // }
  render = () => {
    return (
      <CoderRender />
    );
  };
}

export default new Code(dataRangeAnalyzeMixin);
