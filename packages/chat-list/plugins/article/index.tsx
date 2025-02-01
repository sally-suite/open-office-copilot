import { ChatPluginBase, IChatPlugin } from 'chat-list/types/plugin';
import { IChatMessage } from 'chat-list/types/message';
import i18n from 'chat-list/locales/i18n';
import instruction from './prompt/instruction.md';
import CardIntroduce from 'chat-list/components/card-tools'
import React from 'react';

export class Start extends ChatPluginBase implements IChatPlugin {
  name = 'Article';
  icon = '📘';
  // model = null;
  action = "article";
  placeholder = i18n.t('doc.agent.sally.placeholder', 'Input your message...');;
  shortDescription = i18n.t('agent.article.short_description');
  description = "Generate article for you";
  // introduce = i18n.t('common.wellcome_message', `Hi! I'm Sally, How can I assist you today?`);
  introduce = () => {
    return <CardIntroduce introduction={''} />
  }
  instruction = instruction;
  fileConfig = {
    accept: {
      text: true,
      image: false,
      xlsx: false,
    },
    maxSize: 2 * 1014 * 1024,
    maxFiles: 1,
    multiple: false,
  };
  onSend = (input: IChatMessage) => {
    // 用户发送的消息，拦截，自定义一些操作
    return input;
  };
  tools: any[] = ['search', 'search_news', 'search_images', 'create_images', 'generate_article'];
  agents: any[] = [];
  // injectContext = async () => {
  //   const text = await docApi.getSelectedText();
  //   if (text) {
  //     return `USER SELECTED TEXT:\n\n${text}`
  //   }
  //   return "";
  // }
  onReceive = async (message: IChatMessage) => {
    const { setTyping, plugins } = this.context;
    // const text = message.content as string;
    // no plugin ,chat with GPT
    setTyping(true);

    if (!message.content) {
      return;
    }

    if (message.type == 'parts') {
      if (message.files.some(p => p.name.includes('png') || p.name.includes('jpg') || p.name.includes('jpeg'))) {
        const agent = plugins.find(p => p.action === 'vision');
        const msg = await agent.onReceive(message);
        return msg;
      }
    }
    return await super.onReceive(message)
  }
}

export default new Start();
