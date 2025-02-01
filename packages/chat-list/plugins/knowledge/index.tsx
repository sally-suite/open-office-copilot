import { QuickReplyItem } from 'chat-list/types/message';
import { ChatPluginBase, IChatPlugin, ModeType } from 'chat-list/types/plugin';
import { IChatMessage } from 'chat-list/types/message';
import { template } from 'chat-list/utils';
import { getSheetDataInMarkdown } from 'chat-list/service/sheet';
import { MessagesSquare } from 'lucide-react';
import { getValues } from 'chat-list/service/sheet';
import chatAssistPrompt from './prompt/chat-assist.md';
import chatUserPrompt from './prompt/chat-user.md';
import instruction from './prompt/instruction.md';
import ChatSheetRender from 'chat-list/components/render-knowledge'
import React from 'react';
import { searchIndex } from 'chat-list/utils/vertor';
import gptApi from '@api/gpt';
import { chat } from 'chat-list/service/message';
import VectorCard from 'chat-list/components/card-vector';
import { chunkText, parseDocument } from 'chat-list/utils/file';
import sheetApi from '@api/sheet';
import i18n from 'chat-list/locales/i18n';

export class ChatSheet extends ChatPluginBase implements IChatPlugin {
  name = i18n.t('sheet.agent.knowledge', 'Knowledge Q&A')
  icon = MessagesSquare;
  action = 'knowledge';
  mode?: ModeType = 'custom';
  shortDescription = i18n.t('sheet.agent.knowledge.short_description', "Use your pdf/word/text or sheet as a knowledge base!.");
  description = instruction;
  placeholder = 'Input your question';
  instruction = instruction;
  introduce =
    'Hi! You can chat with this Sheet, first of all you need to build a knowledge base in tool mode, then you can ask questions about the knowledge base.';
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
  initByFile = async (files: File[]) => {
    const titles = ['chunk', 'vector'];
    const values = [];

    let sheetName = '';
    for (let i = 0; i < files.length; i++) {
      const file: File = files[i];
      const text = await parseDocument(file);
      if (text) {
        const chunks = chunkText(text, 500);
        for (let j = 0; j < chunks.length; j++) {
          const result = await gptApi.embeddings({
            model: 'text-embedding-ada-002',
            input: chunks[j]
          });
          console.log(JSON.stringify(result || ''))
          values.push([chunks[j], JSON.stringify(result)])
        }
      }
      sheetName += file.name;
    }
    await sheetApi.initSheet(sheetName, titles);
    await sheetApi.setValues([titles].concat(values), sheetName);
    return sheetName;
  }
  onReceive = async (message: IChatMessage) => {
    // const titles = ['chunk', 'vector'];
    const { appendMsg } = this.context;
    let sheetName;
    if (message.type == 'parts') {
      appendMsg(this.buildChatMessage('Initializing knowledge base'));
      sheetName = await this.initByFile(message.files);
      appendMsg(this.buildChatMessage('Knowledge base initialized successfully'));
      // return this.buildChatMessage(<VectorCard files={message.files} />, 'card', message.from.name, 'assistant', 'Here is knowledeg initialization card, you can click on Initialize button to initialize vector.')
    }
    const values = await getValues(0, sheetName);
    if (values.length <= 1 || !values[0].includes('vector')) {
      return this.buildChatMessage(<VectorCard />, 'card', message.from.name, 'assistant', 'No vectors were found, tell user to upload a file, or build a vector index based on the table data.')
    }
    const titles = values[0];
    const tarVertor = await gptApi.embeddings({
      model: 'text-embedding-ada-002',
      input: message.content
    });
    const vectorIndex = titles.indexOf('vector');
    const rows = values.slice(1);
    const indexs = searchIndex(tarVertor, rows.map(v => JSON.parse(v[vectorIndex])));
    const contents = indexs.map(i => rows[i][0]);
    const contenStr = contents.join('\n');
    const content = `You need answer user's quesiton base on reference content.\n[reference]\n${contenStr}\nuser's quesiton :${message.content}`
    const reuslt = await chat({
      model: 'gpt-3.5-turbo',
      messages: [{
        role: 'system',
        content
      }]
    });
    const response = `${reuslt.content}\n\nReference:${indexs.map(i => `[${i + 2}]`).join(',')}`
    return this.buildChatMessage(response, 'text', message.from.name, 'assistant')
  };
  render = () => {
    return <ChatSheetRender />
  }
}

export default new ChatSheet();
