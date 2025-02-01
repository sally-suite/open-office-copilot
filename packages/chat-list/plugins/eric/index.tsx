import { ChatPluginBase, IChatPlugin } from "chat-list/types/plugin";
import instruction from './promps/instruction.md';
import introduction from './promps/introduction.md';
import i18n from "chat-list/locales/i18n";
import { template } from "chat-list/utils";
import headset from 'chat-list/assets/img/headset.png';
import { IChatMessage, IChatOptions } from "chat-list/types/message";

export class Eric extends ChatPluginBase implements IChatPlugin {
  name = "Eric";
  icon = headset;
  action = "eric";
  description = "Chat with Sally AI Founder.";
  placeholder = i18n.t('agent:eric_placeholder', "Thanks for your feedback");
  shortDescription = 'Chat with Sally AI Founder.';
  instruction = instruction;
  introduce = () => {
    const { user } = this.context;
    const text = i18n.t('agent:eric_introduction', introduction) as unknown as string;
    const content = template(text, {
      user_name: user.username
    });
    return content;
  };
  onReceive(message: IChatMessage, options: IChatOptions = { stream: true }): Promise<any> {
    return super.onReceive(message, {
      ...options,
      model: 'gpt-4o-mini'
    });
  }
}

export default new Eric();
