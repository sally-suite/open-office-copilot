import { QuickReplyItem } from 'chat-list/types/message';
import { ChatPluginBase, IChatPlugin } from 'chat-list/types/plugin';
import { IChatMessage } from 'chat-list/types/message';
import { IMessageBody } from 'chat-list/types/chat';
// import { Image } from 'lucide-react';
import introduce from './prompts/introduce.md';
import instruction from './prompts/instruction.md';
import description from './prompts/description.md';

import { blobToBase64Image, resizeImg } from 'chat-list/utils';
import VisionRender from 'chat-list/components/render-vision';
import React from 'react';
import i18n from 'chat-list/locales/i18n';
import imagePng from 'chat-list/assets/img/image.png';
import { getApiConfig } from 'chat-list/local/local';

export class Vision extends ChatPluginBase implements IChatPlugin {
  name = i18n.t('sheet.agent.vision', 'Vision');
  icon = imagePng;
  fileConfig = {
    accept: {
      image: true
    },
    maxSize: 2 * 1014 * 1024,
    maxFiles: 5,
    multiple: false,
  };
  mode = 'custom';
  action = 'vision';
  // mode?: ModeType = 'custom'
  shortDescription = i18n.t('sheet.agent.vision.short_description', "Extract information from images.");
  description = description;
  instruction = instruction;
  placeholder = 'Upload an image and tell me your requirements.';
  introduce = introduce;
  quickReplies = (input: string) => {
    return [];
  };
  onQuickReply = async (item: QuickReplyItem): Promise<any> => {
    return [];
  };
  onSend = (input: IChatMessage) => {
    return input;
  };
  convertMessage = async (message: IChatMessage): Promise<IMessageBody> => {
    const { type, text, files } = message;
    const ps = files.filter(p => p.type.startsWith('image')).map(async (file) => {
      const base64 = await blobToBase64Image(file);
      const url = await resizeImg(base64, 512, 512);
      // console.log(url)
      return {
        type: 'image_url',
        image_url: {
          url
        }
      };
    });

    const images = await Promise.all(ps);
    const msgs: any = [{ type: 'text', text: text }, ...images];
    return {
      role: 'user',
      content: msgs
    };
  };
  text: string;
  images: File[];
  onReceive = async (message: IChatMessage) => {
    const { appendMsg } = this.context;
    const { type, text, files } = message;
    let msg: any = message;
    if (type == 'parts') {
      msg = await this.convertMessage({ text, files, type: 'parts' } as any);
    }

    const apiKey = await getApiConfig();
    if (apiKey) {
      try {
        return await super.onReceive({ _id: message._id, role: message.role, content: msg.content }, {
          stream: false
        });
      } catch (e) {
        console.error(e);
        appendMsg(this.buildChatMessage("An exception occurs when extracting information from pictures, please make sure that the model supports picture information extraction, we recommend using a multimodal model such as gpt-4o."));
        return;
      }
    }
    return await super.onReceive({ _id: message._id, role: message.role, content: msg.content }, {
      model: 'gpt-4o',
      stream: false
    });

    //const { setTyping, chat, appendMsg, model, updateMsg } = this.context;
    // setTyping(true);
    // if (type == 'file') {
    //   this.images = files;
    //   if (!this.text) {
    //     appendMsg(this.buildChatMessage('Could you provide more details about your requirements or questions related to this image?'));
    //     return;
    //   }
    // }
    // if (type === 'text') {
    //   this.text = text;
    //   if (!this.images) {
    //     return appendMsg(this.buildChatMessage('Could you please upload the image?'));
    //   }
    // }
    // if (type == 'parts') {
    //   this.text = text;
    //   this.images = files;
    // }

    // if (this.text && this.images) {
    //   const msg = await this.convertMessage({ text: this.text, files: this.images, type: 'parts' } as any);
    //   let vm: GptModel = "gpt-4-vision-preview";
    //   if (model.startsWith('gpt')) {
    //     vm = "gpt-4o";
    //   } else if (model.startsWith('glm')) {
    //     vm = "glm-4v";
    //   } else if (model.startsWith('gemini')) {
    //     vm = "gemini-pro-vision";
    //   }
    //   let resMsg = this.buildChatMessage('', 'text', message?.from?.name);
    //   let isAppend = false;
    //   const reuslt = await chat({
    //     model: vm,
    //     messages: [msg],
    //     max_tokens: 1024,
    //     stream: true
    //   }, (done, res) => {
    //     if (!res.content) {
    //       return;
    //     }
    //     if (res.content) {
    //       if (!isAppend) {
    //         resMsg.content = res.content;
    //         appendMsg(resMsg);
    //         isAppend = true;
    //       } else {
    //         resMsg.content = res.content;
    //         updateMsg(resMsg._id, resMsg)
    //       }
    //     }
    //     if (done) {
    //       if (res.content) {
    //         resMsg.content = res.content;
    //         updateMsg(resMsg._id, resMsg)
    //       }
    //       isAppend = false;
    //       resMsg = this.buildChatMessage(res.content, 'text');
    //     }

    //   });
    //   this.push({
    //     role: 'assistant',
    //     content: resMsg.content
    //   })
    //   this.text = '';
    //   this.images = null;
    //   return resMsg;
    //   // return appendMsg(this.buildChatMessage(reuslt.content, 'text', message?.from?.name));
    // }
  };
  sourceImages: string[];
  render() {
    return <VisionRender images={this.sourceImages} />;
  }
}

export default new Vision();
