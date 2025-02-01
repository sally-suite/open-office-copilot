import React from 'react';
import { ChatPluginBase, IChatPlugin } from 'chat-list/types/plugin';
import { IChatMessage, QuickReplyItem } from 'chat-list/types/message';
import sheetApi from '@api/sheet';
import instruction from './prompts/instruction.md';
import description from './prompts/description.md';
import formula from 'chat-list/assets/img/sigma.png';
import FormulaRender from 'chat-list/components/render-formula';
import i18n from 'chat-list/locales/i18n';
export class EditFunction extends ChatPluginBase implements IChatPlugin {
  name = i18n.t('doc.agent.formula', 'Write Formula');
  icon = formula;
  action = 'formula';
  shortDescription = i18n.t('doc.agent.formula.short_description', "Help you write Formula.");
  description = description;
  instruction = instruction;
  placeholder = i18n.t('agent:formula_placeholder', "Help me write a math formula");
  introduce = i18n.t('agent:formula_introduction', "Hi! I'm Sally,How can I assist you today?");
  fileConfig = {
    accept: {
      image: true
    },
    maxSize: 2 * 1014 * 1024,
    maxFiles: 1,
    multiple: false,
  };
  quickReplies = (): any => {
    return [];
  };
  onQuickReply = async (item: QuickReplyItem) => {
    if (item.code === 'rotate-table') {
      await sheetApi.transposeTable();
    }
  };
  // tools: any[] = ['insert_text'];
  onSend = (input: IChatMessage) => {
    // GPT发送的消息，拦截，自定义一些操作
    return input;
  };
  // onReceive = async (message: IChatMessage) => {
  //   // 接收到GPT消息，解析消息，给回复
  //   // const messages = (await buildFunctionCreateMessages(
  //   //   message.content as string
  //   // )) as IMessageBody[];
  //   const { content } = await this.chat(message.content, genFormulaPrompt);
  //   // this.context.appendMsg(this.buildChatMessage(content));
  //   const newMsg = this.buildChatMessage(content, 'text', message.from?.name)
  //   return newMsg;

  // };
  render = () => {
    return <FormulaRender />;
  };
}

export default new EditFunction();
