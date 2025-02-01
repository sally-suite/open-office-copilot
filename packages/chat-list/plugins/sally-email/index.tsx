import { ChatPluginBase, IChatPlugin } from 'chat-list/types/plugin';
import { IChatMessage } from 'chat-list/types/message';
import React from 'react';
import i18n from 'chat-list/locales/i18n';
import instruction from './prompt/instruction.md';
// import SallyAvatar from 'chat-list/components/avatars/sally'
import sallyPng from 'chat-list/assets/img/sally-32.png';
// import SallyRender from 'chat-list/components/render-sally'
import CardIntroduce from 'chat-list/components/card-introduce'
// import introduction from './prompt/introduction.md'
export class Sally extends ChatPluginBase implements IChatPlugin {
  name = 'Sally';
  icon = sallyPng;
  // model = null;
  action = "sally";
  placeholder = i18n.t('doc.agent.sally.placeholder', 'Input your message...');;
  description = "Your AI Assistant, powered by GPT or Gemini.";
  // introduce = i18n.t('doc.wellcome_message', `Hi! I'm Sally,How can I assist you today?`);
  // introduce = i18n.t('prompt:doc_introduction', "Hi! I'm Sally,How can I assist you today?");
  introduce = () => {
    return <CardIntroduce />
  }

  instruction = instruction;
  fileConfig = {
    accept: {
      text: false,
      image: false
    },
    maxSize: 2 * 1014 * 1024,
    maxFiles: 1,
    multiple: false,
  };
  // quickReplies = () => {
  //   return [
  //     {
  //       code: 'test',
  //       name: 'test'
  //     }
  //   ]
  // };
  // onQuickReply = async () => {
  //   const { appendMsg } = this.context;
  //   // const content = await docApi.getDocumentContent();
  //   const content = await docApi.getSelectedText();
  //   appendMsg(this.buildChatMessage(content, 'text', '', 'assistant'));
  //   // console.log(content)

  // };
  onSend = (input: IChatMessage) => {
    // 用户发送的消息，拦截，自定义一些操作
    return input;
  };
  tools: any[] = ['search', 'get_email_content', 'write_email'];
  agents: any[] = [];
  // injectContext = async () => {
  //   const text = await docApi.getSelectedText();
  //   if (text) {
  //     return `CONTEXT:\n\nI have selected the email text within the triple quotes :\n\n"""\n\n${text}\n\n"""`
  //   }
  //   const email = await docApi.getDocumentContent();
  //   if (!email) {
  //     return `CONTEXT:\n\nEmail content is empty`
  //   }
  //   return `CONTEXT:\n\nThere is email content in current window, you can get it with 'get_email_content' tool. `
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
  // render() {
  //   return <SallyRender />
  // }
}

export default new Sally();
