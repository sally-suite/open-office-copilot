import { QuickReplyItem } from "chat-list/types/message";
import { ChatPluginBase, IChatPlugin } from "chat-list/types/plugin";
import { IChatMessage } from "chat-list/types/message";
// import CardProgress from 'chat-list/components/card-tasks/progress'
import instruction from './promps/instruction.md';
import CardTools from 'chat-list/components/card-tools';
import CardStock from 'chat-list/components/card-mystocks';
import React from "react";
import CardStockIndicator from 'chat-list/components/card-stock-indicator';
import { IMessageBody } from "chat-list/types/chat";
import { blobToBase64Image, resizeImg } from "chat-list/utils";
import i18n from 'chat-list/locales/i18n';

// import StockRender from 'chat-list/components/render-stock';
// import i18n from 'chat-list/locales/i18n';

/**
 * Main service, task split ,plan
 */
export class Stocker extends ChatPluginBase implements IChatPlugin {
  name = "Stock";
  icon = '💹';
  // model = null;
  action = "stock";
  placeholder = "Please enter the stock symbol for the US marke and what techniques need to be used to analyze it?";
  shortDescription = i18n.t('agent.stock.short_description');
  description = instruction;
  instruction = instruction;
  introduce = () => {
    return (
      <>
        <CardTools introduction="Hello, I am a stock market analyst. I can assist you with technical analysis 📈 using GPT-4o." />
        <CardStock />
      </>
    );
  };
  quickReplies = () => {
    // return [] as QuickReplyItem[];
    return [{
      code: 'Candlestick Chart',
      name: 'Candlestick Chart',
    }];
  };
  onQuickReply = (quickReply: QuickReplyItem) => {
    const { appendMsg } = this.context;
    appendMsg(this.buildChatMessage(<CardStockIndicator />, 'card', '', 'assistant'));
  };
  onSend = (input: IChatMessage) => {
    // 用户发送的消息，拦截，自定义一些操作
    return input;
  };
  // injectContext = async () => {
  //   return await getSheetInfo()
  // }
  tools = ['search_news', 'analyze_indicators'];
  agents = ['vision'];
  // render = () => {
  //   return <StockRender />
  // }
  convertMessage = async (message: IChatMessage): Promise<IMessageBody> => {
    const { type, text, files } = message;
    const ps = files.filter(p => p.type.startsWith('image')).map(async (file) => {
      const base64 = await blobToBase64Image(file);
      const url = await resizeImg(base64, 512, 512);
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
  onReceive = async (message: IChatMessage) => {
    const { type, text, files } = message;
    let msg: any = message;
    if (type == 'parts') {
      msg = await this.convertMessage({ text, files, type: 'parts' } as any);
    }
    return await super.onReceive({ _id: message._id, role: message.role, content: msg.content }, {
      model: 'gpt-4o',
      stream: false
    });
  };
}

export default new Stocker();
