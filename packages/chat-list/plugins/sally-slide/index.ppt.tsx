import { ChatPluginBase, IChatPlugin } from 'chat-list/types/plugin';
import { IChatMessage, QuickReplyItem } from 'chat-list/types/message';
import React from 'react';
import i18n from 'chat-list/locales/i18n';
import instruction from './prompt/instruction.md';
import sallyPng from 'chat-list/assets/img/sally-32.png';
import CardIntroduce from 'chat-list/components/card-introduce';
import ContextSlide from 'chat-list/components/context-slide';
import SlideRender from 'chat-list/components/render-slide';


export class Start extends ChatPluginBase implements IChatPlugin {
  name = 'Sally';
  icon = sallyPng;
  // model = null;
  action = "sally";
  placeholder = i18n.t('doc.agent.sally.placeholder', 'Input your message...');
  description = "Your AI Assistant, powered by GPT or Gemini.";
  introduce = () => {
    return <CardIntroduce />;
  };
  // quickReplies = () => {
  //   return [
  //     {
  //       code: 'test',
  //       name: 'test'
  //     }
  //   ]
  // }
  // onQuickReply = () => {
  //   const { appendMsg } = this.context;
  //   appendMsg(this.buildChatMessage(mark, 'text'))
  //   docApi.insertText(mark)
  // }
  instruction = instruction;
  fileConfig = {
    accept: {
      xlsx: true,
      text: true,
      image: true
    },
    maxSize: 20 * 1014 * 1024,
    maxFiles: 1,
    multiple: false,
  };
  quickReplies = () => {
    return [{
      code: 'generate',
      name: i18n.t('tool:generate_presentation')
    },
      // {
      //   code: 'test',
      //   name: 'test'
      // }
    ];
  };
  onQuickReply = async (item: QuickReplyItem) => {
    const { appendMsg, setMode } = this.context;
    if (item.code === 'generate') {
      // const msg = this.buildChatMessage(<CardCalogConfirm />, 'card', '', 'assistant')
      // appendMsg(msg);
      setMode(this.action, 'custom');
    }
    else if (item.code === 'test') {
      // const { appendMsg } = this.context;
      // // const { appendMsg } = this.context;
      // const msg = this.buildChatMessage(
      //   <CardSlideRender
      //     slideData={slides}
      //     slideImages={imagesList}
      //     metadata={{
      //       title: 'Sample',
      //       author: 'Sally',
      //     }}
      //   />, 'card', '', 'assistant');
      // appendMsg(msg);
    }
  };
  onSend = (input: IChatMessage) => {
    // 用户发送的消息，拦截，自定义一些操作
    return input;
  };
  tools: any[] = ['search', 'create_images', 'generate_presentation', 'generate_speaker_notes', 'optimize_slide'];
  agents: any[] = ['uml', 'vision', 'python'];
  // injectContext = async () => {
  //   const text = await docApi.getSelectedText();
  //   if (text) {
  //     return `I HAVE SELECTED TEXT:\n\n"""\n${text}\n"""`
  //   }
  //   return "I DIDN'T SELECTED SOME TEXT.";
  // }
  renderMessageContext = (context: string) => {
    const data = JSON.parse(context);
    return (
      <ContextSlide type={data.type} text={data.text} slides={data.slides} />
    );
  };
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
    return <SlideRender />;
  }
}

export default new Start();
