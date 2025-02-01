import React from 'react';
import { QuickReplyItem } from 'chat-list/types/message';
import { ChatPluginBase, IChatPlugin } from 'chat-list/types/plugin';
import { search } from 'chat-list/service/format';
import { IChatMessage } from 'chat-list/types/message';
import FormatCreate from 'chat-list/components/card-format';
import { Palette } from 'lucide-react';
export class FormatSheet extends ChatPluginBase implements IChatPlugin {
  name = 'Format Sheet';
  icon = Palette;
  action = 'format';
  description = 'Help users to beautify the sheet, including background color, font color.';
  introduce = () => {
    return <FormatCreate />;
  };
  quickReplies = (input: string) => {
    return search(input) as QuickReplyItem[];
  };
  onQuickReply = (item: QuickReplyItem) => {
    if (item.code === '/format')
      this.sendMsg?.(this.buildChatMessage(<FormatCreate />, 'card'));
  };
  onSend = (input: IChatMessage) => {
    // 用户发送的消息，拦截，自定义一些操作
    return;
  };
  onReceive = (message: IChatMessage) => {
    // 接收到GPT消息，解析消息，给回复
    this.sendMsg?.(
      this.buildChatMessage(<FormatCreate />, 'card')
    );
    return message;
  };
}

export default new FormatSheet();
