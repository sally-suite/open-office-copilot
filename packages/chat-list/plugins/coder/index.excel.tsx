import { QuickReplyItem } from "chat-list/types/message";
import { ChatPluginBase, IChatPlugin } from "chat-list/types/plugin";
import { Code2 } from "lucide-react";
import introduce from './promps/introduce.md'
import React from "react";
import instruction from './promps/instruction.excel.md';
import CoderRender from 'chat-list/components/render-coder';
// import { tools } from 'chat-list/tools/sheet/coder';
import { getSheetInfo } from "chat-list/service/sheet";
import description from './promps/description.excel.md';
import i18n from 'chat-list/locales/i18n';
import { ISheetInfo } from "chat-list/types/api/sheet";
import ContextSheet from "chat-list/components/context-sheet";

/**
 * Code generation and run it in Google Apps Script
 */
export class Code extends ChatPluginBase implements IChatPlugin {
  name = i18n.t('sheet.agent.coder', 'Coder')
  icon = Code2;
  // model = null;
  action = "coder";
  placeholder = "Tell me your tasks";
  shortDescription = i18n.t('sheet.agent.coder_excel.short_description', "Generate code and run it in Excel.");
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
  }
  tools = ['code_interpreter'];
  renderMessageContext = (context: string) => {
    const sheetInfo: ISheetInfo = JSON.parse(context);
    return (
      <ContextSheet address={sheetInfo.activeRange} />
    )
  }
  render = () => {
    return (
      <CoderRender />
    )
  }
}

export default new Code();
