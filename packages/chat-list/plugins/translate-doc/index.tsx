import React from 'react';
import { ChatPluginBase, IChatPlugin } from 'chat-list/types/plugin';
import { IChatMessage } from 'chat-list/types/message';

import introduce from './prompts/introduce.md';
import { Languages } from 'lucide-react';
import instruction from './prompts/instruction.md';
import CardTranslateDoc from 'chat-list/components/render-translate-doc';
import i18n from 'chat-list/locales/i18n';
export class TranslateSheet extends ChatPluginBase implements IChatPlugin {
  name = 'Translate Doc';
  icon = Languages;
  action = 'translate';
  placeholder = 'Input target language and tone';
  description = 'Translate selected text';
  shortDescription = i18n.t('doc.agent.translate.short_description', "Translate selected text or user inpu to another language.");
  instruction = instruction;
  introduce = introduce;
  onSend = (input: IChatMessage) => {
    // 用户发送的消息，拦截，自定义一些操作
    return;
  };
  render = () => {
    return <CardTranslateDoc />;
  };
}

export default new TranslateSheet();
