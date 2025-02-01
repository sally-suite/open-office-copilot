import { QuickReplyItem } from 'chat-list/types/message';
import { ChatPluginBase, IChatPlugin } from 'chat-list/types/plugin';
import { IChatMessage } from 'chat-list/types/message';
import introduce from './prompts/introduce.md'
import { Table } from 'lucide-react';
import description from './prompts/description.md';
import instruction from './prompts/instruction.md'
import { getSheetInfo } from 'chat-list/service/sheet';
export class Format extends ChatPluginBase implements IChatPlugin {
  name = 'Format';
  icon = Table;
  model = {
    temperature: 0.5,
  };
  action = 'format';
  description = description;
  introduce = introduce;
  instruction = instruction;
  fileConfig = {
    accept: {
      text: true,
    },
    maxSize: 2 * 1014 * 1024,
    maxFiles: 1,
    multiple: false,
  };
  quickReplies = (input: string) => {
    return []
  };
  onQuickReply = (item: QuickReplyItem) => {
    return;
  };
  onSend = (input: IChatMessage) => {
    // 用户发送的消息，拦截，自定义一些操作
    return;
  };
  injectContext = async () => {
    return await getSheetInfo()
  }
}

export default new Format();
