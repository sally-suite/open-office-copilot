import { QuickReplyItem } from 'chat-list/types/message';
import { ChatPluginBase, IChatPlugin } from 'chat-list/types/plugin';
import { IChatMessage } from 'chat-list/types/message';
// import { Image } from 'lucide-react';
import introduce from './prompts/introduce.md';
import instruction from './prompts/instruction.md';
import description from './prompts/description.md';

import ImageRender from 'chat-list/components/render-image';
import React from 'react';
import i18n from 'chat-list/locales/i18n';
import { ImageGenerations } from 'chat-list/types/image';
import gpt from '@api/gpt';
import paintingPng from 'chat-list/assets/img/paint.png';
export class Vision extends ChatPluginBase implements IChatPlugin {
  name = i18n.t('agent.image', 'Generate Image');
  icon = paintingPng;
  mode = 'custom';
  action = 'image';
  // mode?: ModeType = 'custom'
  shortDescription = i18n.t('agent.image.short_description');
  description = description;
  instruction = instruction;
  placeholder = i18n.t('agent.image.short_description');
  introduce = introduce;
  onQuickReply = async (item: QuickReplyItem): Promise<any> => {
    return [];
  };
  onSend = (input: IChatMessage) => {
    return input;
  };
  onReceive = async (message: IChatMessage) => {
    const { appendMsg } = this.context;
    if (!message.content) {
      return;
    }
    const result: ImageGenerations = await gpt.generateImages({
      prompt: message.content,
      n: 1,
      style: 'vivid',
      model: 'dall-e-3',
      response_format: 'url'
    });
    console.log(result);
    if (result?.data?.[0].b64_json) {
      // const content = `![image](data:image/png;base64,${result.data[0].b64_json})\n\n**Prompt:**\n\n${result?.data?.[0].revised_prompt}`
      const content = `![image](data:image/png;base64,${result.data[0].b64_json})`;
      const msg = this.buildChatMessage(content, 'text', message?.from?.name, 'assistant');
      appendMsg(msg);
      return msg;
    } if (result?.data?.[0].url) {
      // const content = `![image](${result.data[0].url})\n\n**Prompt:**\n\n${result?.data?.[0].revised_prompt}`
      const content = `![image](${result.data[0].url})`;
      const msg = this.buildChatMessage(content, 'text', message?.from?.name, 'assistant');
      appendMsg(msg);
      return msg;
    } else {
      const msg = this.buildChatMessage('Task failed', 'text', 'assistant');
      appendMsg(msg);
      return msg;
    }
  };
  render() {
    return <ImageRender />;
  }
}

export default new Vision();
