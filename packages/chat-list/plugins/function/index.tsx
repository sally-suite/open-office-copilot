import React from 'react';
import { ChatPluginBase, IChatPlugin } from 'chat-list/types/plugin';
import { QuickReplyItem } from 'chat-list/types/message';
import introduce from './prompts/introduce.md';
import sheetApi from '@api/sheet';
import instruction from './prompts/instruction.md'
import description from './prompts/description.md'
import { getSheetInfo } from 'chat-list/service/sheet';
import FunctionRender from 'chat-list/components/render-function';
import i18n from 'chat-list/locales/i18n';
import formula from 'chat-list/assets/img/sigma.png'

export class WriteFunction extends ChatPluginBase implements IChatPlugin {
  name = i18n.t('sheet.agent.function', 'Generate Formula')
  icon = formula;
  mode = 'custom';
  action = 'function';
  shortDescription = i18n.t('sheet.agent.function.short_description', "Help you gnerate formula");
  description = description;
  placeholder = 'Sum of the second column ...';
  instruction = instruction;
  introduce = introduce;
  quickReplies = (input: string) => {
    return [
      {
        name: 'Rotate Tale',
        code: 'rotate-table'
      },
    ];
  };
  onQuickReply = async (item: QuickReplyItem) => {
    if (item.code === 'rotate-table') {
      await sheetApi.transposeTable();
    }
  };
  injectContext = async () => {
    return await getSheetInfo()
  }
  render = () => {
    return <FunctionRender />
  }
}

export default new WriteFunction();
