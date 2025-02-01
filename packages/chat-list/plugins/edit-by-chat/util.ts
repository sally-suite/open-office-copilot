import { extractJsonDataFromMd, template } from 'chat-list/utils';
import systemFunction from './prompts/system-function.md';
import systemData from './prompts/system-data.md';
import modeCheck from './prompts/mode-check.md';
import functionUpdate from './prompts/function-update.md';
import { ChatFunction, IMessageBody } from 'chat-list/types/chat';
import { ModeType } from 'chat-list/types/edit';
import { getValues } from 'chat-list/service/sheet';


export const buildDataModeSystemMessage = async (): Promise<IMessageBody> => {
  const data = await getValues();
  const prompt = template(systemData, {
    tableData: JSON.stringify(data)
  });
  const context: IMessageBody = {
    role: 'system',
    content: prompt
  };

  return context;
};

export const buildDataModeMessages = async (input: string) => {
  const data = await getValues();
  const prompt = template(systemData, {
    input,
    tableData: JSON.stringify(data)
  });
  const context = {
    role: 'system',
    content: prompt
  };

  return [
    context, {
      role: 'user',
      content: input
    }
  ];
};
export const buildFunctionModeSystemMessage = async (): Promise<IMessageBody> => {
  const data = await getValues(3);
  const prompt = template(systemFunction, {
    tableData: JSON.stringify(data)
  });
  const context: IMessageBody = {
    role: 'system',
    content: prompt
  };
  return context;
};
export const buildFunctionModeMessages = async (requirements: string) => {
  const data = await getValues(3);
  const prompt = template(systemFunction, {
    requirements,
    tableData: JSON.stringify(data)
  });
  const context = {
    role: 'system',
    content: prompt
  };

  return [
    context, {
      role: 'user',
      content: requirements
    }
  ];
};

export const buildFunctionUpdateMessage = (code: string, input: string): IMessageBody => {
  const prompt = template(functionUpdate, {
    code,
    input
  });
  return {
    role: 'user',
    content: prompt
  };
};

export const checkUserMode = async (chat: ChatFunction, input: string): Promise<ModeType | ''> => {
  const prompt = modeCheck;
  const messages: IMessageBody[] = [{
    role: 'system',
    content: prompt
  }, {
    role: 'user',
    content: `user requirement: ${input}`
  }];
  const { content } = await chat({ messages, temperature: 0 });
  const result = extractJsonDataFromMd(content);
  try {
    return result?.mode || '';
  } catch (e) {
    return '';
  }
};