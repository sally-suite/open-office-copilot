import { QuickReplyItem } from 'chat-list/types/message';
import { ChatPluginBase, IChatPlugin } from 'chat-list/types/plugin';
import { IChatMessage } from 'chat-list/types/message';
import i18n from 'chat-list/locales/i18n';
import instruction from './prompt/instruction.md';
import CardIntroduce from 'chat-list/components/card-tools';
import React from 'react';
import avatar from 'chat-list/assets/img/powerpoint-32.png';
// import docApi from '@api/doc'
// import CardCalogConfirm from 'chat-list/components/card-catalog-confirm';
import SlideRender from 'chat-list/components/render-slide';

// import CardSlideRender from 'chat-list/components/card-slide-render';
// import slides from './slide.json';
// import imagesList from './images.json'
export class Start extends ChatPluginBase implements IChatPlugin {
  name = 'Presentation';
  icon = avatar;
  // model = null;
  action = "presentation";
  mode = 'custom';
  placeholder = i18n.t('slide.agent.sally.placeholder', 'Input your message...');;
  shortDescription = i18n.t('agent.presentation.short_description');
  description = "Generate PowerPoint for you";
  // introduce = i18n.t('common.wellcome_message', `Hi! I'm Sally, How can I assist you today?`);
  introduce = () => {
    return <CardIntroduce introduction={''} />;
  };
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
  quickReplies = () => {
    return [
      //   {
      //   code: 'generate',
      //   name: i18n.t('tool:generate_presentation')
      // },
      // {
      //   code: 'test',
      //   name: 'test'
      // }
    ];
  };
  onQuickReply = async (item: QuickReplyItem) => {
    // const { appendMsg, setPreview } = this.context;
    // if (item.code === 'generate') {
    //   // const msg = this.buildChatMessage(<CardCalogConfirm />, 'card', '', 'assistant')
    //   // appendMsg(msg);
    // } else if (item.code == 'test') {
    //   const { appendMsg } = this.context;
    //   const msg = this.buildChatMessage(
    //     <CardSlideRender
    //       slideData={slides}
    //       slideImages={imagesList}
    //       metadata={{
    //         title: 'Sample',
    //         author: 'Sally',
    //       }}
    //     />, 'card', '', 'assistant');
    //   appendMsg(msg);
    //   // setPreview({
    //   //   title: 'Generate PowerPoint',
    //   //   className: 'flex-1',
    //   //   component: (
    //   //     <CardSlideRender
    //   //       slideData={slides}
    //   //       slideImages={[]}
    //   //       metadata={{
    //   //         title: 'Sample',
    //   //         author: 'Sally',
    //   //       }} />
    //   //   )
    //   // })
    // }




  };
  onSend = (input: IChatMessage) => {
    // 用户发送的消息，拦截，自定义一些操作
    return input;
  };
  tools: any[] = ['search', 'create_images', 'generate_presentation'];
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
    return await super.onReceive(message);
  };
  render() {
    return <SlideRender />;
  }
}

export default new Start();
