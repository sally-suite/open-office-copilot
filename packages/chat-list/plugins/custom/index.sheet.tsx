import { ChatPluginBase, IChatPlugin } from "chat-list/types/plugin";
// import { tools } from 'chat-list/tools/sheet/coder';
import { IAgent } from "chat-list/types/agent";
import { ISheetInfo } from "chat-list/types/api/sheet";
import ContextSheet from "chat-list/components/context-sheet";
import React from "react";
import { IChatMessage } from "chat-list/types/message";
import CardUpload from 'chat-list/components/card-upload'
import { dataRangeAnalyzeMixin } from '../_mixins/sheet';

/**
 * Code generation and run it in Google Apps Script
 */
export class CustomAgent extends ChatPluginBase implements IChatPlugin {
  constructor(agent: IAgent) {
    super(dataRangeAnalyzeMixin);
    this.id = agent.id + '';
    this.name = agent.name;
    this.icon = agent.avatar;
    this.tools = agent.tools;
    this.agents = [];
    this.instruction = agent.instruction || '';
    this.description = agent.description || '';
    this.introduce = agent.introduce || `Hi,I'm ${this.name},How can I assistant you?`
    this.dataAsContext = agent.dataAsContext;
    this.action = this.name;
    this.isCustom = true;
  }
  dataAsContext: boolean;
  renderMessageContext = (context: string) => {
    const sheetInfo: ISheetInfo = JSON.parse(context);
    return (
      <ContextSheet address={sheetInfo.activeRange} />
    )
  }
  initialize = false;
  uploadFile = async (): Promise<File> => {
    const { appendMsg, setMode } = this.context;
    return new Promise((resolve, reject) => {
      appendMsg(this.buildChatMessage(<CardUpload onUpload={async (files) => {
        window.INPUT_EXCEL_FILE = files[0]
        // const wboutArrayBuffer = await window.INPUT_EXCEL_FILE.arrayBuffer();
        // await prepareFolder(['/input'], false)
        // await prepareFolder(['/output'], true)
        // await writeFile('/input/data.xlsx', new Uint8Array(wboutArrayBuffer));
        // setMode('custom');
        resolve(files[0])
      }} />, 'card'))
    })
  }
  onReceive = async (message: IChatMessage) => {
    const { setTyping } = this.context;
    if (!message.content) {
      return;
    }
    setTyping(true);

    if (message.mentions.length == 0 && this.memory.length == 0) {
      setTyping(true);
      await (this as any).showSheetInfo(message);
      return;
    }
    return await super.onReceive(message)
  }
  // tools = tools;
  // injectContext = async () => {
  //   const { docType } = this.context;
  //   if (docType === 'sheet') {
  //     if (!this.dataAsContext) {
  //       return '';
  //     }
  //     return await getSheetInfo()
  //   } else if (docType == 'doc') {
  //     const text = await docApi.getSelectedText();
  //     if (text) {
  //       return `I have selected some text.`
  //     }
  //     return "I didn't selected some text.";
  //   } else {
  //     return '';
  //   }
  // }
}

export default CustomAgent;
