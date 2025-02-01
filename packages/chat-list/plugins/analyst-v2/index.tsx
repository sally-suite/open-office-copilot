import { QuickReplyItem } from "chat-list/types/message";
import { ChatPluginBase, IChatPlugin } from "chat-list/types/plugin";
import { IChatMessage } from "chat-list/types/message";
// import CardProgress from 'chat-list/components/card-tasks/progress'
import { Glasses } from "lucide-react";
import introduce from './promps/introduce.md'
import { getSheetInfo } from 'chat-list/service/sheet';
import instruction from './promps/instruction.md';
import i18n from 'chat-list/locales/i18n';

/**
 * Main service, task split ,plan
 */
export class Analyst extends ChatPluginBase implements IChatPlugin {
  name = i18n.t('sheet.agent.analyst', 'Data Analyst');
  icon = Glasses;
  // model = null;
  action = "analyst";
  placeholder = "Input you data analyze requiremtns such us this sheet data is about...and I want to analyze...";
  shortDescription = i18n.t('sheet.agent.analyst.short_description', "Analyze data and generate analytical reports.");
  description = instruction;
  instruction = instruction;
  introduce = introduce;
  fileConfig = {
    accept: {
      text: false,
      xlsx: false
    },
    maxSize: 9999,
    maxFiles: 1,
    multiple: false
  };
  quickReplies = () => {
    return [] as QuickReplyItem[];
  };
  onSend = (input: IChatMessage) => {
    // 用户发送的消息，拦截，自定义一些操作
    return input;
  };
  injectContext = async () => {
    return await getSheetInfo()
  }
  tools = ['python_interpreter', 'pip_install'];
}

export default new Analyst();
