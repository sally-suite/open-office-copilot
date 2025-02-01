import React from 'react';
import { ChatPluginBase, IChatPlugin } from 'chat-list/types/plugin';
import { IChatMessage, QuickReplyItem } from 'chat-list/types/message';
import {
  buildDataModeMessages,
  buildFunctionModeMessages
} from './util';
import sheetApi from '@api/sheet';
import CardUpdateConfirm from 'chat-list/components/card-update-confirm';
import { IMessageBody } from 'chat-list/types/chat';
import {
  extractCodeFromMd,
  extractJsonDataFromMd,
  sleep,
} from 'chat-list/utils';
import { ModeType } from 'chat-list/types/edit';
import FormatCreate from 'chat-list/components/card-format';
import { getValues } from 'chat-list/service/sheet';
import instruction from './prompts/instruction.md';
import introduce from './prompts/introduce.md'
import i18n from 'chat-list/locales/i18n';
import { tools } from 'chat-list/tools/sheet/intelligent'
import IntelligentRender from 'chat-list/components/render-intelligent'
import { chatByPrompt } from 'chat-list/service/message';
import avatarPng from 'chat-list/assets/img/steps.png'
// import second from './prompts/introduce.md'
// import returnFuncion from './prompts/return.md';

// const mode = getLocalStore('sheet-chat-edit-mode') || 'auto';

export class EditSheet extends ChatPluginBase implements IChatPlugin {
  name = i18n.t('sheet.agent.intelligent', 'Generate by Row');
  icon = avatarPng;
  selectedRange = '';
  mode = 'custom';
  action = 'intelligent';
  shortDescription = i18n.t('sheet.agent.intelligent.short_description', "Do summaries, Q&A, sentiment analysis and other tasks.");
  instruction = instruction;
  description = instruction;
  placeholder = 'Input you intelligent task here...';
  fromLeader = false;
  introduce = introduce;
  reset = () => {
    this.selectedRange = '';
    this.shortTermMemory = [];
    this.modeCache = '';
    this.currentCode = '';
    this.sendMsg(
      this.buildChatMessage(this.introduce(), 'card')
    );
  };
  askRequirements = async () => {
    this.context.setTyping(true);
    await sleep();
    const msg = this.buildChatMessage(
      'Could you please provide me with the specific requirements for editing the data?',
      'text'
    );
    this.sendMsg(msg);
    this.context.setTyping(false);
  };
  quickReplies = (input: string) => {
    return [
      {
        action: '/edit',
        name: 'Rotate',
        code: 'rotate-table',
      }
    ];
  };
  onQuickReply = async (item: QuickReplyItem) => {
    if (item.code === 'rotate-table') {
      await sheetApi.transposeTable();
    } else if (item.code === 'format-table') {
      this.sendMsg?.(this.buildChatMessage(<FormatCreate />, 'card'));
    }
  };
  getSheetDataByDataMode = async (message: any): Promise<string[][]> => {
    const messages = (await buildDataModeMessages(
      message.content
    )) as IMessageBody[];
    const { content } = await this.context.chat({ messages, temperature: 0 });
    // const content = input.content;
    const data = extractJsonDataFromMd(content as string);
    let value = data;
    if (!Array.isArray(data)) {
      if (Array.isArray(data.data)) {
        value = data.data;
      }
    }
    return value;
  };
  getSheetDataByFunctionMode = async (message: any): Promise<string[][]> => {
    const messages = (await buildFunctionModeMessages(
      message.content
    )) as IMessageBody[];
    const { content } = await this.context.chat({ messages, temperature: 0 });
    const jsCode = extractCodeFromMd(content as string);
    const initFunc = (code: string) => {
      const fun = eval(`(function() {${code}; \n return handleSheetData;})`);
      return fun();
    };

    const data = await getValues();
    const fun = initFunc(jsCode);
    const copy = JSON.parse(JSON.stringify(data));
    const result = fun(copy);
    return result;

  };
  transferForData = async (content: string, message: IChatMessage) => {
    // GPT发送的消息，拦截，自定义一些操作
    try {
      const data = extractJsonDataFromMd(content as string);
      let value = data;
      if (!Array.isArray(data)) {
        if (Array.isArray(data.data)) {
          value = data.data;
        }
      }
      if (Array.isArray(value) && value.length > 0 && Array.isArray(value[0]) && value[0].length > 0) {
        this.context.appendMsg(this.buildChatMessage(
          <CardUpdateConfirm data={value} />,
          'card',
          message.from.name,
          'assistant',
        ))
        return this.buildChatMessage('Ok,I have show data to you,you can check it and update data to sheet.', 'text', message.from.name, 'assistant',);
      }

      return this.buildChatMessage(content, 'text', message.from.name, 'assistant',);
    } catch (err) {
      return this.buildChatMessage(content, 'text', message.from.name, 'assistant',);
    }
  };

  onSend = (input: IChatMessage) => {
    return input;
  };
  shortTermMemory: IMessageBody[] = [];
  modeCache: ModeType | '';
  currentCode = '';
  tools: any = [];
  onReceive = async (message: IChatMessage) => {
    const tool = tools.find(p => p.name == 'apply_prompt_by_row')
    const res = await chatByPrompt(instruction, message.content, {
      tool_choice: {
        type: 'function',
        function: {
          name: tool.name
        }
      },
      tools: [{
        type: 'function',
        function: {
          name: tool.name,
          description: tool.description,
          parameters: tool.parameters
        },
      }]
    })
    let args
    if (res.tool_calls.length > 0) {
      const toolCall = res.tool_calls[0];
      args = JSON.parse(toolCall.function.arguments);
    } else {
      args = {
        requirements: message.content
      }
    }
    const result = await tool.func({
      ...args,
      context: this.context
    })
    return result as unknown as IChatMessage;
  };
  render() {
    return <IntelligentRender />
  }
}

export default new EditSheet();
