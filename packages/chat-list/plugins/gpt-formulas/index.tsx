import React from 'react';
import { ChatPluginBase, IChatPlugin } from 'chat-list/types/plugin';
import { IChatMessage, QuickReplyItem } from 'chat-list/types/message';
import introduce from './prompts/introduce.md';
import sheetApi from '@api/sheet';
import { Sigma } from 'lucide-react';
import instruction from './prompts/instruction.md'
import description from './prompts/description.md'

import FormulaRender from 'chat-list/components/render-formula';
export class EditFunction extends ChatPluginBase implements IChatPlugin {
  name = "GPT Formulas"
  icon = Sigma;
  action = 'gpt-formula';
  shortDescription = "Help you write GPT Formulas.";
  description = description;
  placeholder = 'Input your message';
  instruction = instruction;
  introduce = introduce;
  quickReplies = (): any => {
    return [];
  };
  onQuickReply = async (item: QuickReplyItem) => {
    if (item.code === 'rotate-table') {
      await sheetApi.transposeTable();
    }
  };
  onSend = (input: IChatMessage) => {
    // GPT发送的消息，拦截，自定义一些操作
    return input;
  };
  render = () => {
    return <FormulaRender />
  }
}

export default new EditFunction();
