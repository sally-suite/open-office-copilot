import { QuickReplyItem } from "chat-list/types/message";
import { ChatPluginBase, IChatPlugin } from "chat-list/types/plugin";
import { IChatMessage } from "chat-list/types/message";
import React from "react";
import instruction from './promps/instruction.md';
import PythonRender from 'chat-list/components/render-python';
import { getSheetInfo } from "chat-list/service/sheet";
import description from './promps/description.md';
import i18n from 'chat-list/locales/i18n';
import { initEnv, prepareFolder } from "chat-list/tools/sheet/python/util";
import CardUpload from 'chat-list/components/card-upload';
import avatarPng from 'chat-list/assets/img/excel-32.png';
import { blobToBase64Image, resizeImg } from "chat-list/utils";
import { IMessageBody } from "chat-list/types/chat";
import { dataRangeAnalyzeMixin } from '../_mixins/sheet';
import sheetApi from '@api/sheet';

/**
 * Generate python code and run it to browser to edit Excel
 */
export class Code extends ChatPluginBase implements IChatPlugin {
  name = i18n.t('sheet.agent.python', 'Python');
  icon = avatarPng;
  // model = null;
  action = "excel";
  placeholder = i18n.t('agent:excel_placeholder', "Upload Excel file and input your data analysis request");
  shortDescription = i18n.t('sheet.agent.python.short_description', "Generate python code and run it to edit data or generate charts.");
  description = description;
  instruction = instruction;
  introduce = i18n.t('agent:excel_introduction', "How can I assist you today?");
  fileConfig = {
    accept: {
      text: false,
      xlsx: true
    },
    maxSize: 99999999,
    maxFiles: 1,
    multiple: false
  };
  quickReplies = () => {
    // return [{
    //   code: 'editor',
    //   name: 'Editor'
    // }] as QuickReplyItem[];
    return [];
  };
  onQuickReply = async (quickReply: QuickReplyItem) => {
    // const context = this.context;
    // if (quickReply.code == 'editor') {
    //   context.setMode('custom');
    // }
    // const { appendMsg } = this.context;
    // await this.uploadFile();
    // const sheetInfo = await sheetApi.getSheetInfo();
    // const value = await this.getTableImage(sheetInfo);
    // this.uploadFile();
  };
  tools = ['pip_install', 'python_interpreter'];
  injectContext = async () => {
    return await getSheetInfo();
  };
  initialize = false;
  uploadFile = async (): Promise<File> => {
    const { appendMsg, setMode } = this.context;
    return new Promise((resolve, reject) => {
      appendMsg(this.buildChatMessage(<CardUpload onUpload={async (files) => {
        window.INPUT_EXCEL_FILE = files[0];
        // const wboutArrayBuffer = await window.INPUT_EXCEL_FILE.arrayBuffer();
        // await prepareFolder(['/input'], false)
        // await prepareFolder(['/output'], true)
        // await writeFile('/input/data.xlsx', new Uint8Array(wboutArrayBuffer));
        // setMode('custom');
        resolve(files[0]);
      }} />, 'card'));
    });
  };
  convertMessage = async (message: IChatMessage): Promise<IMessageBody> => {
    const { text, files } = message;
    const ps = files.filter(p => p.type.startsWith('image')).map(async (file) => {
      const base64 = await blobToBase64Image(file);
      const url = await resizeImg(base64, 512, 512);
      // console.log(url)
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
  // getTableImage = async (): Promise<File> => {
  //   const { appendMsg } = this.context;
  //   const values = await getValues(5);
  //   console.log(values)
  //   return new Promise((resolve) => {
  //     appendMsg(this.buildChatMessage(
  //       <CardTable values={values} onScreenshot={async (base64) => {
  //         const file = await base64ToFile(base64, 'screenshot.png');
  //         await resolve(file)
  //       }} />
  //       , 'card', '', 'assistant'));
  //   })
  // }
  // async onReceive(message: IChatMessage, options?: { stream: boolean; }): Promise<any> {
  //   const { showMessage } = this.context;
  //   const { type, files } = message;
  //   if (type == 'parts') {
  //     window.INPUT_EXCEL_FILE = files[0]
  //   }
  //   if (!window.INPUT_EXCEL_FILE) {
  //     await this.uploadFile();
  //   }
  //   if (!this.initialize) {
  //     const toolMsg = showMessage(i18n.t('python:init_env', 'Initializing Python environment.Please wait a moment.'));
  //     await initEnv();
  //     toolMsg.succeeded(i18n.t('python:init_env_success', 'Python environment initialization completed.'));
  //     this.initialize = true;
  //   }

  //   const { setTyping, model, plugins, appendMsg, updateMsg, agentTools, tools } = this.context;
  //   setTyping(true);

  //   if (model !== 'gpt-4o' && this.memory.length == 0) {
  //     const sheetInfo = await getSheetInfo();
  //     if (sheetInfo) {
  //       this.push({ role: 'user', content: message.content })
  //       const newMsg = this.buildChatMessage('', 'text', message.to, 'assistant');
  //       let isAppend = false;
  //       const result = await chatByTemplate(understandPrompt, {
  //         input: message.content,
  //         sheet_info: sheetInfo,
  //         language: (message.content as string).substring(0, 2)
  //       },
  //         { stream: true },
  //         (done, result) => {
  //           if (!result.content) {
  //             return;
  //           }
  //           if (!isAppend) {
  //             isAppend = true;
  //             newMsg.content = result.content;
  //             appendMsg(newMsg)
  //           } else {
  //             newMsg.content = result.content;
  //             updateMsg(newMsg._id, newMsg);
  //           }
  //         }
  //       )
  //       this.push({ role: 'assistant', content: result.content })
  //       return;
  //     }
  //   } else if (model == 'gpt-4o') {
  //     let msg: any = message;
  //     if (this.memory.length == 0) {
  //       const file = await this.getTableImage();
  //       msg = await this.convertMessage({ text: message.content, files: [file], type: 'parts' } as any);
  //     }

  //     return await super.onReceive({ _id: message._id, role: message.role, content: msg.content }, {
  //       model: 'gpt-4o',
  //       stream: true
  //     })
  //   }
  //   // return await super.onReceive(message, options)
  // }
  // text: string;
  // files: File[];
  // onReceive = async (message: IChatMessage) => {
  //   const { setTyping } = this.context;
  //   const { type, text, files } = message;
  //   setTyping(true);

  //   if (type == 'parts') {
  //     this.text = text;
  //     window.INPUT_EXCEL_FILE = files[0]
  //   }
  //   return super.onReceive(message)
  // };
  getTableImage: (sheetInfo: any) => Promise<any>;
  analyzeSheetInfo: (content: string) => Promise<string>;
  showSheetInfo: (message: IChatMessage) => void;
  onReceive = async (message: IChatMessage) => {
    const { setTyping } = this.context;
    setTyping(true);
    if (!message.content) {
      return;
    }
    const { showMessage } = this.context;
    const { type, files } = message;
    if (type == 'parts') {
      window.INPUT_EXCEL_FILE = files[0];
    }
    if (!window.INPUT_EXCEL_FILE) {
      window.INPUT_EXCEL_FILE = await this.uploadFile();
    }

    if (!this.initialize) {
      const toolMsg = showMessage(i18n.t('python:init_env', 'Initializing Python environment.Please wait a moment.'));
      await initEnv();
      toolMsg.succeeded(i18n.t('python:init_env_success', 'Python environment initialization completed.'));
      this.initialize = true;
    }
    // if (this.memory.length == 0) {
    //   setTyping(true);
    //   this.push({ role: 'user', content: message.content })
    //   const sheetInfo = await this.analyzeSheetInfo(message.content);
    //   setTyping(true);
    //   this.push({ role: 'assistant', content: sheetInfo })
    //   return;
    // }
    if (message.mentions.length == 0 && this.memory.length == 0) {
      setTyping(true);
      await prepareFolder(['/output'], true);
      const sheetInfo = await sheetApi.getSheetInfo();
      message.context = JSON.stringify(sheetInfo, null, 2);
      await this.showSheetInfo(message);
      return;
    }
    return await super.onReceive(message);
  };
  render = () => {
    return (
      <PythonRender />
    );
  };
}

export default new Code(dataRangeAnalyzeMixin);
