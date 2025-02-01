import { QuickReplyItem } from "chat-list/types/message";
import { ChatPluginBase, IChatPlugin } from "chat-list/types/plugin";
import { IChatMessage } from "chat-list/types/message";
import introduce from './prompt/introduce.md'
import { FileText } from 'lucide-react'

/**
 * Main service, task split ,plan
 */
export class Main extends ChatPluginBase implements IChatPlugin {
  onQuickReply: (quickReply: QuickReplyItem) => void;
  name = "Markdown to Doc";
  icon = FileText;
  // model = null;
  action = "markdoc";
  placeholder = "Input your Markdown content.";
  description = "Convert your Markdown to Document";
  instruction = "Convert your Markdown to Document"
  introduce = introduce;
  quickReplies = (input: string) => {
    return [] as QuickReplyItem[];
  };
  onSend = (input: IChatMessage) => {
    // 用户发送的消息，拦截，自定义一些操作
    return input;
  };

  onReceive = async (message: IChatMessage) => {
    const { setTyping, messages, plugin, mode, plugins, chat, appendMsg, sendMsg } = this.context;
    const text = message.content as string;
    // no plugin ,chat with GPT
    setTyping(true);
    // if (message.mentions.length > 0) {
    //   appendMsg(this.buildChatMessage(text, 'text'))
    // } else {
    //   appendMsg(this.buildChatMessage('Copy the message you sent to the document,do not insert 😄', 'text'))
    // }
    appendMsg(this.buildChatMessage(text, 'text'))
    appendMsg(this.buildChatMessage('Copy above message to the document, do not insert 😄', 'text'))

    setTyping(false);
  };
}

export default new Main();
