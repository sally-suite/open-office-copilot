import { ChatPluginBase, IChatPlugin } from "chat-list/types/plugin";
import { IChatMessage } from "chat-list/types/message";
import { IMessageBody } from "chat-list/types/chat";
import instruction from './promps/instruction.md'
import CardFormulaInfo from "chat-list/components/card-sheet-info";
import React from "react";
import i18n from 'chat-list/locales/i18n';
import sallyPng from 'chat-list/assets/img/sally-32.png';
import CardIntroduce from 'chat-list/components/card-introduce'
import { dataRangeAnalyzeMixin } from '../_mixins/sheet';
import ContextSheet from "chat-list/components/context-sheet";
import { ISheetInfo } from "chat-list/types/api/sheet";
/**
 * Main service, task split ,plan
 */
export class Main extends ChatPluginBase implements IChatPlugin {
  name = "Sally";
  icon = sallyPng;
  model = {
    prompt: ``,
    temperature: 0.7
  }
  action = "sally";
  placeholder = i18n.t('sheet.agent.sally.placeholder', "Chat with me Or @ agent to help you.");
  shortDescription = "";
  description = "Your AI Assistant, help you edit sheet, powered by GPT or Gemini.";
  instruction = instruction;
  introduce = () => {
    return <CardIntroduce />
  }
  fileConfig = {
    accept: {
      text: true,
      image: true
    },
    maxSize: 2 * 1014 * 1024,
    maxFiles: 3,
    multiple: true,
  };
  quickReplies = () => {
    // const { colAgents = [], plugins } = this.context;
    // const agents = (colAgents || []).filter(agent => {
    //   if (!agent.enable) {
    //     return false;
    //   }
    //   const plg = plugins.find(p => p.action == agent.id);
    //   if (plg) {
    //     return plg.render
    //   }
    //   return true;
    // }).map((agent) => {
    //   return {
    //     code: agent.id,
    //     name: capitalizeFirstLetter(i18n.t(`sheet.agent.${agent.id}` as any)),
    //     tip: i18n.t(`sheet.agent.${agent.id}.short_description`, '')
    //   }
    // });

    // return [
    //   // {
    //   //   code: 'setting',
    //   //   name: i18n.t('sheet.menu.data_context', 'Data Context'),
    //   //   tip: i18n.t('sheet.menu.data_context_tip', 'Show the data context of the current chat')
    //   // },
    //   ...agents
    // ]
    // return [{
    //   code: 'test',
    //   name: 'test'
    // }];
    return [];
  };
  onQuickReply = async () => {
    // const { appendMsg, setDataContext, plugins, setPlugin, setMode } = this.context;
    // if (item.code === 'setting') {
    //   appendMsg?.(this.buildChatMessage(
    //     <CardFormulaInfo
    //       onSubmit={(content: string) => {
    //         console.log(content);
    //         setDataContext(content);
    //         appendMsg(buildChatMessage(content, 'text', 'user'));
    //       }}
    //     />, 'card'));
    // } else {
    //   const plg = plugins.find(p => p.action == item.code);
    //   setMode('custom');
    //   setPlugin(plg);
    // }
    // const tableInfo = await this.getTableImage();
    // console.log(tableInfo)
  };
  onSend = (input: IChatMessage) => {
    // 用户发送的消息，拦截，自定义一些操作
    return input;
  };
  conversationMemory: IMessageBody[] = [];
  currentTask: { name: string, requirement: string };
  step = 0;

  confirmSheetInfo = async (): Promise<string> => {
    return new Promise((resolve) => {
      this.context.appendMsg(this.buildChatMessage(
        <CardFormulaInfo onSubmit={(content) => {
          resolve(content);
        }} />, 'card'))
    })
  }
  tools = ['generate_table', 'complete_table', 'generate_function', 'generate_pivot_table', 'code_interpreter'];
  agents = ['intelligent', 'translate', 'vision', 'coder', 'python'];
  // injectContext = async () => {
  //   return await getSheetInfo()
  // }
  // getTableImage: () => Promise<any>;
  // analyzeDataRange: (content: string) => Promise<void>;
  // showSheetInfo: (message: IChatMessage) => void;
  renderMessageContext = (context: string) => {
    const sheetInfo: ISheetInfo = JSON.parse(context);
    return (
      <ContextSheet address={sheetInfo.activeRange} />
    )
  }
  onReceive = async (message: IChatMessage) => {
    const { setTyping } = this.context;
    setTyping(true);
    if (!message.content) {
      return;
    }
    if (message.mentions.length == 0 && this.memory.length == 0) {
      setTyping(true);

      await (this as any).showSheetInfo(message);
      return;
    }
    return await super.onReceive(message)
  }
}
export default new Main(dataRangeAnalyzeMixin);
