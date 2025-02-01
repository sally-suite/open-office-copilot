import React from 'react';
import { QuickReplyItem } from 'chat-list/types/message';
import { ChatPluginBase, IChatPlugin, ITool, ModeType } from 'chat-list/types/plugin';
import { IChatMessage } from 'chat-list/types/message';
import CardTranslate from 'chat-list/components/card-translate';
import CardTranslateSet from 'chat-list/components/card-translate/setting';

import introduce from './prompts/introduce.md';
// import { Languages } from 'lucide-react';
import instruction from './prompts/instruction.md';
import TanslateRender from 'chat-list/components/render-translate';
import i18n from 'chat-list/locales/i18n';
import anatorPng from 'chat-list/assets/img/translator.png';

export class TranslateSheet extends ChatPluginBase implements IChatPlugin {
  name = i18n.t('sheet.agent.translate', 'Translate');
  icon = anatorPng;
  action = 'translate';
  mode = 'custom';
  placeholder = 'Input the target language as well as the tone, the default tone is normal';
  shortDescription = i18n.t('sheet.agent.translate.short_description', "Translate your sheets.");
  description = instruction;
  introduce = introduce;
  instruction = instruction;
  quickReplies = (input: string) => {
    return [
      {
        action: '/translate',
        name: 'Translate Sheet'
      },
      {
        action: '/translate',
        name: 'Setting'
      },
    ] as unknown as QuickReplyItem[];
  };
  onQuickReply = (item: QuickReplyItem) => {
    if (item.name == 'Translate Sheet') {
      this.sendMsg(this.buildChatMessage(<CardTranslate />, 'card'));
    }
    if (item.name === 'Setting') {
      this.sendMsg(this.buildChatMessage(<CardTranslateSet
        title="Setting"
        onChange={() => {
          this.sendMsg(this.buildChatMessage('Set successfully!'));
        }}
      />, 'card'));
    }
  };
  onSend = (input: IChatMessage) => {
    // 用户发送的消息，拦截，自定义一些操作
    return;
  };
  tools = ['translate_sheet'];
  render = () => {
    return <TanslateRender />;
  };
}

export default new TranslateSheet();
