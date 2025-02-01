import { QuickReplyItem } from 'chat-list/types/message';
import { ChatPluginBase, IChatPlugin } from 'chat-list/types/plugin';
import { IChatMessage } from 'chat-list/types/message';
import { template } from 'chat-list/utils';
import { getSheetDataInMarkdown } from 'chat-list/service/sheet';
import { MessagesSquare } from 'lucide-react';
import { getValues } from 'chat-list/service/sheet';
import chatAssistPrompt from './prompt/chat-assist.md';
import chatUserPrompt from './prompt/chat-user.md'
import instruction from './prompt/instruction.md'
export class SheetChat extends ChatPluginBase implements IChatPlugin {
  name = 'Chat with Sheet';
  icon = MessagesSquare;
  modelCache: any = null;
  action = 'chatsheet';
  shortDescription = "Chat with Sheet";
  description = instruction;
  placeholder = 'Input your question';
  instruction = instruction;
  introduce =
    'Hi! You can chat with this Sheet, first of all can you briefly introduce this Sheet?';
  quickReplies = (input: string) => {
    // return searchTemplate(input) as QuickReplyItem[];
    return [] as QuickReplyItem[];
  };
  onQuickReply = (item: QuickReplyItem) => {
    return;
  };
  onSend = (input: IChatMessage) => {
    // 用户发送的消息，拦截，自定义一些操作
    return input;
  };
  buildAssistPrompt = async () => {
    const values = await getValues();
    const tableData = getSheetDataInMarkdown(values);
    const msg = template(chatAssistPrompt, {
      table: tableData,
    });
    return msg;
  };
  injectContext = async () => {
    const values = await getValues();
    const tableData = getSheetDataInMarkdown(values);
    const msg = template(chatUserPrompt, {
      table: tableData,
    });
    return msg;
  };
  // onReceive = async (message: IChatMessage) => {
  //   // 接收到GPT消息，解析消息，给回复
  //   const prompt = await this.buildAssistPrompt();
  //   const { content } = await this.chat(message.content, prompt)
  //   return this.buildChatMessage(content, 'text', message.from.name)
  // };
}

export default new SheetChat();
