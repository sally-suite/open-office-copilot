import { ChatPluginBase, IChatPlugin } from 'chat-list/types/plugin';
import { IChatMessage } from 'chat-list/types/message';
import i18n from 'chat-list/locales/i18n';
import instruction from './prompt/instruction.md';
import sallyPng from 'chat-list/assets/img/sally-32.png';
import { dataRangeAnalyzeMixin } from 'chat-list/plugins/_mixins/sheet';
import { initEnv } from "chat-list/tools/sheet/python/util";
import CardTools from 'chat-list/components/card-tools';
import CardAgents from 'chat-list/components/card-agents';
import React from 'react';
import { getSheetInfo } from 'chat-list/service/sheet';
// import mark from './mark.md';

export class Start extends ChatPluginBase implements IChatPlugin {
  name = 'Sally';
  icon = sallyPng;
  // model = null;
  action = "sally";
  placeholder = "Message Sally";
  description = "Your AI Assistant";
  // introduce = i18n.t('common.wellcome_message', `Hi! I'm Sally, How can I assist you today?`);
  introduce = () => {
    return (
      <>
        <CardTools introduction={''} />
        <CardAgents introduction={''} />
      </>
    );
  };
  instruction = instruction;
  fileConfig = {
    accept: {
      text: false,
      image: false
    },
    maxSize: 20 * 1014 * 1024,
    maxFiles: 1,
    multiple: false,
  };
  onSend = (input: IChatMessage) => {
    // 用户发送的消息，拦截，自定义一些操作
    return input;
  };
  quickReplies = () => {


    return [
      // {
      //   code: 'test1',
      //   name: 'test1'
      // },
      // {
      //   code: 'test2',
      //   name: 'test2'
      // }
    ];
  };
  onQuickReply = async () => {
    // const { appendMsg, setPlugins, plugins } = this.context;
    // appendMsg(this.buildChatMessage(mark, 'text'))
  };
  tools: any[] = ['search', 'pip_install', 'python_interpreter'];
  agents: any[] = ['vision'];
  initialize = false;
  injectContext = async () => {
    return await getSheetInfo();
  };
  onReceive = async (message: IChatMessage) => {
    const { setTyping, plugins, showMessage } = this.context;
    // const text = message.content as string;
    // no plugin ,chat with GPT
    setTyping(true);

    if (!message.content) {
      return;
    }

    if (message.type == 'parts') {
      if (message.files.some(p => p.name.includes('png') || p.name.includes('jpg') || p.name.includes('jpeg'))) {
        const agent = plugins.find(p => p.action === 'vision');
        const msg = await agent.onReceive(message);
        return msg;
      }
      if (message.files.some(p => p.name.includes('xlsx') || p.name.includes('xls'))) {

        const { type, files } = message;
        if (type == 'parts') {
          window.INPUT_EXCEL_FILE = files[0];
        }

        if (!this.initialize) {
          const toolMsg = showMessage(i18n.t('python:init_env', 'Initializing Python environment.Please wait a moment.'));
          await initEnv();
          toolMsg.succeeded(i18n.t('python:init_env_success', 'Python environment initialization completed.'));
          this.initialize = true;
        }
        if (this.memory.length == 0) {
          setTyping(true);
          await (this as any).showSheetInfo(message);
          return;
        }
      }
    }
    // else if (window.INPUT_EXCEL_FILE) {
    //   // 判断 file 是否是xlsx文件
    //   const file = window.INPUT_EXCEL_FILE as File;

    //   if (file.name.includes('xlsx') || file.name.includes('xls')) {
    //     if (this.memory.length == 0) {
    //       setTyping(true);
    //       await (this as any).showSheetInfo(message);
    //       return;
    //     }
    //   }

    // }

    return await super.onReceive(message);
  };
}

export default new Start(dataRangeAnalyzeMixin);
