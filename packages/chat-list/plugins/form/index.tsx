import React from 'react';
import { ChatPluginBase, IChatPlugin } from 'chat-list/types/plugin';
import { IChatMessage, QuickReplyItem } from 'chat-list/types/message';
import sheetApi from '@api/sheet';
import { IMessageBody } from 'chat-list/types/chat';
import { ModeType } from 'chat-list/types/edit';
import FormatCreate from 'chat-list/components/card-format';
import { LayoutList } from 'lucide-react';
import instruction from './prompts/instruction.md';
import introduce from './prompts/introduce.md'
import i18n from 'chat-list/locales/i18n';
import FormRender from 'chat-list/components/render-form'

export class FormSheet extends ChatPluginBase implements IChatPlugin {
  name = i18n.t('sheet.agent.form', 'Form');
  icon = LayoutList;
  selectedRange = '';
  mode = 'custom';
  action = 'form';
  shortDescription = i18n.t('sheet.agent.form.short_description', "Convert row data to Form.");
  instruction = instruction;
  description = instruction;
  placeholder = 'Input you intelligent task here...';
  fromLeader = false;
  introduce = introduce;
  reset = () => {
    this.selectedRange = '';
    this.shortTermMemory = [];
    this.modeCache = '';
    this.currentCode = '';
    this.sendMsg(
      this.buildChatMessage(this.introduce(), 'card')
    );
  };
  quickReplies = (input: string) => {
    return [
      {
        action: '/edit',
        name: 'Rotate',
        code: 'rotate-table',
      }
    ];
  };
  onQuickReply = async (item: QuickReplyItem) => {
    if (item.code === 'rotate-table') {
      await sheetApi.transposeTable();
    } else if (item.code === 'format-table') {
      this.sendMsg?.(this.buildChatMessage(<FormatCreate />, 'card'));
    }
  };
  onSend = (input: IChatMessage) => {
    return input;
  };
  shortTermMemory: IMessageBody[] = [];
  modeCache: ModeType | '';
  currentCode = '';
  tools: any = [];
  render() {
    return <FormRender />
  }
}

export default new FormSheet();
