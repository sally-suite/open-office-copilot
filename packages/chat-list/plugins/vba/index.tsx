import { QuickReplyItem } from "chat-list/types/message";
import { ChatPluginBase, IChatPlugin } from "chat-list/types/plugin";
import { IChatMessage } from "chat-list/types/message";
import React from "react";
import instruction from './promps/instruction.md';
import VbaRender from 'chat-list/components/render-vba';
// import { tools } from 'chat-list/tools/sheet/coder';
import description from './promps/description.md';
import i18n from 'chat-list/locales/i18n';
import vbaPng from 'chat-list/assets/img/vba-32.png';
import { dataRangeAnalyzeMixin } from '../_mixins/sheet';
import ContextSheet from "chat-list/components/context-sheet";
import { ISheetInfo } from "chat-list/types/api/sheet";

/**
 * Code generation and run it in Google Apps Script
 */
export class Code extends ChatPluginBase implements IChatPlugin {
  name = i18n.t('sheet.agent.vba', "VBA");
  icon = vbaPng;
  // model = null;
  action = "vba";
  placeholder = i18n.t('agent:vba_placeholder', "Input your vba code generation request");
  shortDescription = i18n.t('sheet.agent.vba.short_description', "Generate VBA code for you.");
  description = description;
  instruction = instruction;
  introduce = i18n.t('agent:vba_introduction', "How can I assist you today?");
  quickReplies = (input: string) => {
    return [] as QuickReplyItem[];
  };
  onSend = (input: IChatMessage) => {
    // 用户发送的消息，拦截，自定义一些操作
    return input;
  };
  tools: any = [];
  // injectContext = async () => {
  //   return await getSheetInfo()
  // }
  // analyzeDataRange: (content: string) => Promise<void>;
  // showSheetInfo: (message: IChatMessage) => void;
  renderMessageContext = (context: string) => {
    const sheetInfo: ISheetInfo = JSON.parse(context);
    return (
      <ContextSheet address={sheetInfo.activeRange} />
    );
  };
  // onReceive = async (message: IChatMessage) => {
  //   const { setTyping } = this.context;
  //   if (!message.content) {
  //     return;
  //   }
  //   setTyping(true);
  //   if (this.memory.length == 0) {
  //     setTyping(true);
  //     await (this as any).showSheetInfo(message);
  //     return;
  //   }
  //   return await super.onReceive(message)
  // }
  render = () => {
    return <VbaRender />;
  };
}

export default new Code(dataRangeAnalyzeMixin);
