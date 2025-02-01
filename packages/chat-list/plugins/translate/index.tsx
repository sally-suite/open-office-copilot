import React from 'react';
import { QuickReplyItem } from 'chat-list/types/message';
import { ChatPluginBase, IChatPlugin } from 'chat-list/types/plugin';
import { IChatMessage } from 'chat-list/types/message';
import CardTranslate from 'chat-list/components/card-translate';
import CardTranslateSet from 'chat-list/components/card-translate/setting';
import { getTranslateEngine, setTargetLanguage } from 'chat-list/local/local';
import sheetApi from '@api/sheet';

import { buildTranslateFunctionMessage, buildTranslateMessages } from './translate-messages';
import introduce from './prompts/introduce.md';
import { LANGUAGE_MAP } from 'chat-list/data/translate/languages';
import { translateSheetByGoogle, translateSheetByGpt } from 'chat-list/service/translate';
import { ILangItem } from 'chat-list/types/translate';
import { Languages } from 'lucide-react';
import instruction from './prompts/instruction.md';
export class TranslateSheet extends ChatPluginBase implements IChatPlugin {
  name = 'translate-sheet';
  icon = Languages;
  action = 'translate';
  placeholder = 'Translate your input';
  description = "Translate sheets or your input.";
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
  onReceive = async ({ content, from, role }: IChatMessage) => {
    const res = await this.checkInput(content);
    if (res.function_call) {
      const name = res.function_call.name;
      const args = JSON.parse(res.function_call.arguments);
      const engine = getTranslateEngine();
      let lng: ILangItem;
      if (args.target) {
        lng = LANGUAGE_MAP.find((p) => p.value === args.target);
      }
      if (!lng) {
        lng = LANGUAGE_MAP.find((p) => p.text === args.target);
      }
      if (lng) {
        setTargetLanguage(lng);
        if (name === 'translateSheet') {
          if (this.context.platform == 'google' && (!engine || engine === 'google')) {
            await translateSheetByGoogle('', lng.value);
          } else {
            await translateSheetByGpt('', lng.text);
          }
          this.sendMsg(this.buildChatMessage(<CardTranslate />, 'card', from?.name));
        }

      } else {
        this.sendMsg(this.buildChatMessage(<CardTranslate />, 'card', from?.name));
      }
      return this.buildChatMessage('Task completed.', 'text', from?.name);
    }
    return this.buildChatMessage(res.content, 'text', from?.name);

  };
  async checkInput(input: string) {
    const { prompt, tools } = await buildTranslateFunctionMessage();
    const result = await this.chat(input, prompt, tools);
    const { tool_calls, content } = result;
    if (!tool_calls || tool_calls?.length <= 0) {
      return {
        content
      };
    }
    const function_call = tool_calls?.[0].function;
    return {
      content,
      function_call
    };
  };
  async translateText(content: string, from: ILangItem, to: ILangItem) {
    const engine = getTranslateEngine();
    if (
      this.context.platform === 'google' &&
      (!engine || engine === 'google')
    ) {
      return this.translateTextByGoogle(content, from, to);
    }
    return this.translateTextByGpt(content, from, to);
  }
  async translateTextByGoogle(content: string, from: ILangItem, to: ILangItem) {
    const res = await sheetApi.translateText(content, from?.value, to?.value);
    return res;
  }
  async translateTextByGpt(content: string, from: ILangItem, to: ILangItem) {
    const messages = buildTranslateMessages(to?.text, content);
    const result = await this.context.chat({
      messages,
      temperature: 0
    });
    return result?.content;
  }
}

export default new TranslateSheet();
