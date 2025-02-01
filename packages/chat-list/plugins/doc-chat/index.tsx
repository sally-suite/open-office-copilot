import { QuickReplyItem } from 'chat-list/types/message';
import { ChatPluginBase, IChatPlugin } from 'chat-list/types/plugin';
import { IChatMessage } from 'chat-list/types/message';
import { MessagesSquare } from 'lucide-react';
export class SheetChat extends ChatPluginBase implements IChatPlugin {
  name = 'Chat with Doc';
  icon = MessagesSquare;
  modelCache: any = null;
  // model = async (): Promise<IModelConfig> => {
  //   if (this.modelCache) {
  //     return this.modelCache;
  //   }
  //   const doc = await docApi.getDocumentContent();
  //   const msg = template(prompt, {
  //     doc,
  //   });
  //   this.modelCache = {
  //     temperature: 0.7,
  //     prompt: msg,
  //   } as IModelConfig;
  //   return this.modelCache;
  // };
  action = 'chatdoc';
  description = "Answer user questions based on document content.";
  placeholder = 'Input your question';
  introduce =
    'Hi! You can chat with this document, Do you have any questions?';
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
  // onReceive = async (message: IChatMessage) => {
  //   // 接收到GPT消息，解析消息，给回复
  //   const messages = await buildChatMessages(
  //     this.context.messages,
  //     'user',
  //     message.content as string,
  //     (await this.model()).prompt
  //   );
  //   const { content } = await this.context.chat({ messages, temperature: 0 });
  //   const newMsg = this.buildChatMessage(content);
  //   this.sendMsg(newMsg);
  //   this.sendTaskSuccessMsg('', message.from);
  //   this.context.setTyping(false)
  //   return message;

  // };
}

export default new SheetChat();
