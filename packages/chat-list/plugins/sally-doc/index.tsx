import { QuickReplyItem } from 'chat-list/types/message';
import { ChatPluginBase, IChatPlugin } from 'chat-list/types/plugin';
import { IChatMessage } from 'chat-list/types/message';
import React from 'react';
// import { capitalizeFirstLetter } from 'chat-list/utils';
import i18n from 'chat-list/locales/i18n';
import instruction from './prompt/instruction.md';
import sallyPng from 'chat-list/assets/img/sally-32.png';
import CardIntroduce from 'chat-list/components/card-introduce';
import CardPrompts from 'chat-list/components/card-prompts';
// import docApi from '@api/doc';
// import mark from './case.txt';
// import introduction from './prompt/introduction.md'
export class Sally extends ChatPluginBase implements IChatPlugin {
  name = 'Sally';
  icon = sallyPng;
  // model = null;
  action = "sally";
  placeholder = i18n.t('doc.agent.sally.placeholder', 'Input your message...');;
  description = "Your AI Assistant, powered by GPT.";
  // introduce = i18n.t('doc.wellcome_message', `Hi! I'm Sally,How can I assist you today?`);
  // introduce = i18n.t('prompt:doc_introduction', "Hi! I'm Sally,How can I assist you today?");
  introduce = () => {
    return (
      <>
        <CardIntroduce />
        <CardPrompts />
      </>
    )
  };
  instruction = instruction;
  fileConfig = {
    accept: {
      text: true,
      image: true,
      xlsx: false,
    },
    maxSize: 20 * 1014 * 1024,
    maxFiles: 3,
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
      // },
      // {
      //   code: 'test1',
      //   name: 'test1'
      // },
      // {
      //   code: 'test2',
      //   name: 'test2'
      // },
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
    // const { appendMsg, setPlugins, plugins } = this.context;
    // appendMsg(this.buildChatMessage(mark, 'text'))
    // docApi.insertText(mark)
  };
  onSend = (input: IChatMessage) => {
    // 用户发送的消息，拦截，自定义一些操作
    return input;
  };
  tools: any[] = ['search', 'get_document_content', 'insert_text', 'code_interpreter'];
  agents: any[] = ['vision', 'uml', 'formula'];
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
}

export default new Sally();
