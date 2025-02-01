import { ChatPluginBase, IChatPlugin } from 'chat-list/types/plugin';
import { IChatMessage } from 'chat-list/types/message';
import i18n from 'chat-list/locales/i18n';
import instruction from './prompt/instruction.md';
import CardIntroduce from 'chat-list/components/card-introduce';
import React from 'react';
// import docApi from '@api/doc'
import sallyPng from 'chat-list/assets/img/sally-32.png';
// import mark from './mark.md'
export class Sally extends ChatPluginBase implements IChatPlugin {
  name = 'Sally';
  icon = sallyPng;
  // model = null;
  action = "sally";
  placeholder = i18n.t('doc.agent.sally.placeholder', 'Input your message...');;
  description = "";
  // introduce = i18n.t('common.wellcome_message', `Hi! I'm Sally, How can I assist you today?`);
  introduce = () => {
    return <CardIntroduce />;
  };
  instruction = instruction;
  fileConfig = {
    accept: {
      text: true,
      image: true,
      xlsx: false
    },
    maxSize: 2 * 1014 * 1024,
    maxFiles: 1,
    multiple: false,
  };
  onSend = (input: IChatMessage) => {
    // 用户发送的消息，拦截，自定义一些操作
    return input;
  };
  quickReplies = () => {
    // return [
    //   {
    //     code: 'test1',
    //     name: 'test1'
    //   },
    // {
    //   code: 'test2',
    //   name: 'test2'
    // }
    // ]
  };
  onQuickReply = async (item: QuickReplyItem) => {
    // const { appendMsg } = this.context;
    // appendMsg(this.buildChatMessage(mark, 'text'))
  };
  tools: any[] = ['search', 'search_news', 'search_images', 'create_images', 'get_page_content'];
  agents: any[] = [];
  // injectContext = async () => {
  //   const text = await docApi.getSelectedText();
  //   if (text) {
  //     return `CONTEXT:\n\nI have selected the text within the triple quotes :\n"""\n${text}\n"""`
  //   }
  //   return "CONTEXT:\n\nI did't selected any text in web page.";
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
    return await super.onReceive(message);
  };
}

export default new Sally();
