import { ChatPluginBase, IChatPlugin } from 'chat-list/types/plugin';
import { IChatMessage } from 'chat-list/types/message';
import React from 'react';
import i18n from 'chat-list/locales/i18n';
import instruction from './prompt/instruction.md';
// import introduction from './prompt/introduction.md'
import CardPapers from 'chat-list/components/card-papers';
import paperPng from 'chat-list/assets/img/poem.png';

export class Paper extends ChatPluginBase implements IChatPlugin {
  name = 'Paper';
  icon = paperPng;
  // model = null;
  action = "paper";
  mode = 'chat';
  placeholder = i18n.t('agent:paper_placeholder', "Ask me about your research topics or papers!");
  introduce = i18n.t('agent:paper_introduction', 'You are now a professional academic paper writing assistant.');
  instruction = instruction;
  fileConfig = {
    accept: {
      text: true,
      image: true,
      xlsx: false,
    },
    maxSize: 2 * 1014 * 1024,
    maxFiles: 1,
    multiple: false,
  };

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
    ];
  };
  onQuickReply = async (item: QuickReplyItem) => {
    // const { appendMsg, showMessage } = this.context;
  };
  onSend = (input: IChatMessage) => {
    // 用户发送的消息，拦截，自定义一些操作
    return input;
  };
  tools: any[] = ['search', 'insert_text', 'get_document_content', 'search_papers'];
  agents: any[] = [];
  // injectContext = async () => {
  //   const text = await docApi.getSelectedText();
  //   if (text) {
  //     return `CONTEXT:\n\nI have selected the text within the triple quotes :\n"""\n${text}\n"""`
  //   }
  //   return "CONTEXT:\n\nI did't selected any text in document.";
  // }
  onReceive = async (message: IChatMessage) => {
    const { setTyping, plugins } = this.context;
    // const text = message.content as string;
    // no plugin ,chat with GPT
    setTyping(true);

    if (!message.content) {
      return;
    }

    return await super.onReceive(message);
  };
  render() {
    return (
      <CardPapers papers={[]} />
    );
  }
}

export default new Paper();
