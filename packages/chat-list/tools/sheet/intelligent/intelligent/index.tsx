import { IMessageBody } from 'chat-list/types/chat';
import instruction from './instruction.md'
import { ChatState, ITool } from 'chat-list/types/plugin';
import { buildChatMessage, extractJsonDataFromMd } from 'chat-list/utils';
import sheetApi from '@api/sheet';
import { template } from 'chat-list/utils';
import systemData from './system-data.md'
import { getValues } from 'chat-list/service/sheet'


export const buildDataModeSystemMessage = async (): Promise<string> => {
  const data = await getValues();
  const prompt = template(systemData, {
    tableData: JSON.stringify(data)
  })

  return prompt;
}

export const func = async ({ requirements, context, dataContext }: { requirements: string, context: ChatState, dataContext: string }) => {

  const systemPrompt = await buildDataModeSystemMessage();
  const messages: IMessageBody[] = [{
    role: 'system',
    content: systemPrompt,
  }, {
    role: 'user',
    content: requirements
  }]
  const { content } = await context.chat({ messages });
  try {
    const data = extractJsonDataFromMd(content as string);
    let value = data;
    if (!Array.isArray(data)) {
      if (Array.isArray(data.data)) {
        value = data.data;
      }
    }
    if (Array.isArray(value) && value.length > 0 && Array.isArray(value[0]) && value[0].length > 0) {
      await sheetApi.setValues(value);
      return buildChatMessage('Ok,I have update data to you,you can check it and update data to sheet.', 'text', 'assistant',);
    }

    return buildChatMessage(content, 'text', 'assistant',);
  } catch (err) {
    return buildChatMessage(content, 'text', 'assistant',);
  }
}

export default {
  type: 'function',
  name: 'intelligent',
  description: instruction,
  parameters: {
    "type": "object",
    "properties": {
      "requirements": {
        "type": "string",
        "description": `user requirements`
      }
    },
    "required": ['requirements']
  },
  func
} as unknown as ITool;
