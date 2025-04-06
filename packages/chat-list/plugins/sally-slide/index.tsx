import { QuickReplyItem } from 'chat-list/types/message';
import { ChatPluginBase, IChatPlugin } from 'chat-list/types/plugin';
import { IChatMessage } from 'chat-list/types/message';
import React from 'react';
import i18n from 'chat-list/locales/i18n';
import instruction from './prompt/instruction.md';
import sallyPng from 'chat-list/assets/img/sally-32.png';
import CardIntroduce from 'chat-list/components/card-introduce/index';
// import slideElements from 'chat-list/tools/slide/create/generate_ppt_by_step_v3/prompts/data.json';
// import CardCalogConfirm from 'chat-list/components/card-catalog-confirm'
import ContextSlide from 'chat-list/components/context-slide';
import SlideRender from 'chat-list/components/render-slide';
// import introduction from './prompt/introduction.md'
// import CardSlideRender from 'chat-list/components/card-slide-render';
// import slides from '../presentation/slides.json';
// import imagesList from '../presentation/images.json'
// import CardSlideRender from 'chat-list/components/card-slide-render';
export class Sally extends ChatPluginBase implements IChatPlugin {
  name = 'Sally';
  icon = sallyPng;
  // model = null;
  action = "sally";
  placeholder = i18n.t('doc.agent.sally.placeholder', 'Input your message...');;
  description = "Your AI Assistant, powered by GPT or Gemini.";
  // introduce = i18n.t('doc.wellcome_message', `Hi! I'm Sally,How can I assist you today?`);
  // introduce = i18n.t('prompt:slide_introduction', "Hi! I'm Sally,How can I assist you today?");
  introduce = () => {
    return <CardIntroduce />;
  };
  instruction = instruction;
  fileConfig = {
    accept: {
      xlsx: false,
      text: true,
      image: true
    },
    maxSize: 20 * 1014 * 1024,
    maxFiles: 1,
    multiple: false,
  };
  // quickReplies = () => {
  //   return [{
  //     code: 'generate',
  //     name: 'Generate'
  //   }];
  // };
  // sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  // onQuickReply = async (item: QuickReplyItem) => {
  //   const { appendMsg, showMessage } = this.context;
  //   // const msg = this.buildChatMessage(<CardCalogConfirm catalog={{}} />, 'card')
  //   // appendMsg(msg);
  //   const msg = showMessage(<CardSlideRender
  //     slideData={[]}
  //     slideImages={imagesList}
  //     metadata={{
  //       title: 'Sample',
  //       author: 'Sally',
  //     }} />, 'assistant', 'card');
  //   for (let i = 0; i < sample.length; i++) {
  //     const list = sample.slice(0, i + 1);
  //     await this.sleep(3000);
  //     msg.update(<CardSlideRender
  //       slideData={list}
  //       // slideImages={imagesList}
  //       metadata={{
  //         title: 'Sample',
  //         author: 'Sally',
  //       }} />)
  //   }
  //   // const msg = this.buildChatMessage()

  //   // appendMsg(msg);

  // };
  quickReplies = () => {
    return [
      {
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
    if (item.code === 'generate') {
      const { appendMsg, setMode } = this.context;
      // const msg = this.buildChatMessage(<CardCalogConfirm />, 'card', '', 'assistant')
      // appendMsg(msg);
      setMode(this.action, 'custom');
    } else if (item.code === 'test') {
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
  //   const selectedText = await docApi.getSelectedText();
  //   let data = '';

  //   if (selectedText) {
  //     data += `CONTEXT:\n\nI have selected the text within the triple quotes :\n\n"""\n\n${selectedText}\n\n"""`
  //   } else {
  //     const selectSlides = await docApi.getSelectedSlides();
  //     const content = selectSlides.map((item) => {
  //       return `PPT Slide[${item.num}]:\n\n${item.texts.join('\n')}`
  //     }).join('\n\n');
  //     data += `I HAVE SELECTED PPT SLIDES:\n\n${content}`;
  //   }
  //   return data;
  // }
  renderMessageContext = (context: string) => {
    const data = JSON.parse(context);
    return (
      <ContextSlide type={data.type} text={data.text} slides={data.slides} />
    );
  };
  onReceive = async (message: IChatMessage) => {
    const { setTyping } = this.context;
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

export default new Sally();
