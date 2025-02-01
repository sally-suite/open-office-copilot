import React from 'react';
import { ChatPluginBase, IChatPlugin } from 'chat-list/types/plugin';
import { IChatMessage, QuickReplyItem } from 'chat-list/types/message';
import {
  buildDataModeMessages,
  buildFunctionModeMessages,
  checkUserMode,
  buildDataModeSystemMessage,
  buildFunctionModeSystemMessage,
  buildFunctionUpdateMessage
} from './util';
import sheetApi from '@api/sheet';
import CardSelectRange from 'chat-list/components/card-select-range';
import CardUpdateConfirm from 'chat-list/components/card-update-confirm';
import CardCodeEdit from 'chat-list/components/card-code-edit';
import { IMessageBody } from 'chat-list/types/chat';
import {
  extractCodeFromMd,
  extractJsonDataFromMd,
  sleep,
} from 'chat-list/utils';
import { ModeType } from 'chat-list/types/edit';
import { getLocalStore, setLocalStore } from 'chat-list/local/local';
import FormatCreate from 'chat-list/components/card-format';
import { FileEdit } from 'lucide-react';
import { getValues } from 'chat-list/service/sheet';

// import returnFuncion from './prompts/return.md';

const mode = getLocalStore('sheet-chat-edit-mode') || 'auto';

export class EditSheet extends ChatPluginBase implements IChatPlugin {
  name = 'Edit Sheet';
  icon = FileEdit;
  selectedRange = '';
  mode: 'data' | 'function' | 'auto' = mode || 'auto';
  action = 'edit';
  description = 'Let GPT or Gemini help you edit data.';
  placeholder = 'Add $ to the second column.';
  fromLeader = false;
  introduce = () => {
    return (
      <CardSelectRange
        mode={this.mode}
        onModeChange={(mode) => {
          this.mode = mode;
          this.modeCache = '';
          this.shortTermMemory = [];
          this.currentCode = '';
          setLocalStore('sheet-chat-edit-mode', mode);
        }}
        onRangeChange={(range) => {
          this.selectedRange = range;
          this.askRequirements();
        }}
      />
    );
  };
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
      },
      {
        action: '/edit',
        name: 'Format',
        code: 'format-table',
      },
      {
        action: '/edit',
        name: 'Reselect',
        code: 'reselect-range',
      },
    ];
  };
  onQuickReply = async (item: QuickReplyItem) => {
    if (item.code === 'rotate-table') {
      // toast.loading('Wait a moment...');
      await sheetApi.transposeTable();
      // toast.success('Success');
    } else if (item.code === 'format-table') {
      this.sendMsg?.(this.buildChatMessage(<FormatCreate />, 'card'));
    } else if (item.code === 'reselect-range') {
      this.reset();
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
  transferForData = async (input: IChatMessage) => {
    // GPT发送的消息，拦截，自定义一些操作
    const content = input.content;
    try {
      const data = extractJsonDataFromMd(content as string);
      let value = data;
      if (!Array.isArray(data)) {
        if (Array.isArray(data.data)) {
          value = data.data;
        }
      }
      if (Array.isArray(value) && value.length > 0 && Array.isArray(value[0]) && value[0].length > 0) {
        return this.buildChatMessage(
          <CardUpdateConfirm
            data={value}
            onUpdate={() => {
              this.sendMsg(this.buildChatMessage(`Update successfully!`));
              this.reset();
            }}
            onCancel={() => {
              this.reset();
            }}
          />,
          'card'
        );
      }

      return this.buildChatMessage(content);
    } catch (err) {
      return this.buildChatMessage(content);
    }
  };
  transferForFunction = async (input: IChatMessage) => {
    // GPT发送的消息，拦截，自定义一些操作
    const content = input.content;
    try {
      const jsCode = extractCodeFromMd(content as string);
      if (jsCode) {
        const sourceData = await getValues();
        return this.buildChatMessage(
          <CardCodeEdit
            data={sourceData}
            code={jsCode}
            onUpdate={() => {
              this.sendMsg(this.buildChatMessage(`Update successfully!`));
              this.reset();
            }}
            onCancel={() => {
              this.reset();
            }}
            onError={(err) => {
              this.sendMsg(
                this.buildChatMessage(
                  `Sorry, there are some errors when excute function. \`${err?.message}\``
                )
              );
              // this.sendMsg(this.buildChatMessage(content));
            }}
          />,
          'card'
        );
      }

      return this.buildChatMessage(content);
    } catch (err) {
      return this.buildChatMessage(content);
    }
  };
  onSend = (input: IChatMessage) => {
    return input;
  };
  shortTermMemory: IMessageBody[] = [];
  modeCache: ModeType | '';
  handleData = async (message: IChatMessage) => {
    this.context.setTyping(true);
    if (this.shortTermMemory.length == 0) {
      const context = await buildDataModeSystemMessage();
      this.shortTermMemory.push(context);
    }
    this.shortTermMemory.push({
      role: message.role,
      content: `Refer to the most recent update result to complete this requirement:${message.content}`,
    });

    const { content } = await this.context.chat({ messages: this.shortTermMemory, temperature: 0 });

    this.shortTermMemory.push({
      role: 'assistant',
      content
    });
    const newMsg = await this.transferForData(this.buildChatMessage(content));
    this.sendMsg(newMsg);
    this.context.setTyping(false);
  };
  currentCode = '';
  handleFunction = async (message: any) => {
    this.context.setTyping(true);
    if (this.shortTermMemory.length == 0) {
      const context = await buildFunctionModeSystemMessage();
      this.shortTermMemory.push(context);
    }
    if (!this.currentCode) {
      this.shortTermMemory.push({
        role: message.role,
        content: `Requirements:${message.content}`,
      });
    } else {
      this.shortTermMemory.push(buildFunctionUpdateMessage(this.currentCode, message.content));
    }

    const { content } = await this.context.chat({ messages: this.shortTermMemory, temperature: 0 });
    this.currentCode = extractCodeFromMd(content as string);
    this.shortTermMemory.pop();
    const newMsg = await this.transferForFunction(this.buildChatMessage(content));
    this.sendMsg(newMsg);
    this.context.setTyping(false);
  };
  handleFromLeader = async (mode: ModeType, message: IChatMessage) => {
    if (mode === 'data') {
      const value = await this.getSheetDataByDataMode(message);
      await sheetApi.setValues(value);
    } else if (mode == 'function') {
      const value = await this.getSheetDataByFunctionMode(message);
      await sheetApi.setValues(value);
    }
    this.modeCache = '';
    this.sendTaskSuccessMsg('', message.from);
  };
  handleByMode = async (mode: ModeType, message: IChatMessage) => {
    if (mode === 'data') {
      await this.handleData(message);
    } else {
      await this.handleFunction(message);
    }
  };

  onReceive = async (message: IChatMessage) => {
    let mode: ModeType | '' = this.mode;

    this.context.setTyping(true);
    if (!this.modeCache) {
      if (this.mode === 'auto') {
        mode = await checkUserMode(this.context.chat, message.content as string);
        if (!mode) {
          mode = 'data';
        }
      }
      this.modeCache = mode;
    }

    // if message from leader, need to auto update sheet data,and return successfully message
    if (message?.role === 'assistant') {
      await this.handleFromLeader(this.modeCache, message);
    } else {
      await this.handleByMode(this.modeCache, message);
    }


  };
}

export default new EditSheet();
