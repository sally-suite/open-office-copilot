import { QuickReplyItem } from 'chat-list/types/message';
import { ChatPluginBase, IChatPlugin } from 'chat-list/types/plugin';
import { IChatMessage } from 'chat-list/types/message';
// import React from 'react';
// import { capitalizeFirstLetter } from 'chat-list/utils';
import i18n from 'chat-list/locales/i18n';
import instruction from './prompt/instruction.md';
import sallyPng from 'chat-list/assets/img/claude.png';
import { GptModel } from 'chat-list/types/chat';
// import CardIntroduce from 'chat-list/components/card-introduce/index.doc'
// import docApi from '@api/doc';
// import mark from './mark.md';
// import introduction from './prompt/introduction.md'
export class Sally extends ChatPluginBase implements IChatPlugin {
  name = 'Claude';
  icon = sallyPng;
  // model = null;
  models = ['claude-3.5-sonnet' as GptModel];
  action = "claude";
  placeholder = i18n.t('doc.agent.sally.placeholder', 'Input your message...');;
  description = "Your AI Assistant, powered by Claude.";
  // introduce = i18n.t('doc.wellcome_message', `Hi! I'm Sally,How can I assist you today?`);
  introduce = "Hi! I'm Sally,How can I assist you today?";
  // introduce = () => {
  //   return <CardIntroduce />
  // }
  instruction = instruction;
  quickReplies = () => {
    return [
      // {
      //   code: 'test1',
      //   name: 'test1'
      // },
      // {
      //   code: 'test2',
      //   name: 'test2'
      // }
    ]
  };
  onQuickReply = async (item: QuickReplyItem) => {
    // const { appendMsg, setPlugins, plugins } = this.context;
    // appendMsg(this.buildChatMessage(mark, 'text'))
    // docApi.insertText(mark)
    // setPlugins(plugins.filter((plugin) => plugin.action !== 'sally'))
  }
  onSend = (input: IChatMessage) => {
    // 用户发送的消息，拦截，自定义一些操作
    return input;
  };
  tools: any[] = [];
  agents: any[] = [];
  // injectContext = async () => {
  //   const text = await docApi.getSelectedText();
  //   if (text) {
  //     return `CONTEXT:\n\nI have selected the text within the triple quotes :\n"""\n${text}\n"""`
  //   }
  //   return "CONTEXT:\n\nI did't selected any text in document.";
  // }
  // onReceive = async (message: IChatMessage) => {
  //   const { setTyping, plugins } = this.context;
  //   // const text = message.content as string;
  //   // no plugin ,chat with GPT
  //   setTyping(true);

  //   if (!message.content) {
  //     return;
  //   }

  //   return await super.onReceive(message)
  // }
}

export default new Sally();
