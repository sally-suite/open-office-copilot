import { template } from 'chat-list/utils';
import systemFunction from './prompts/system-function.md';
import { IMessageBody, ToolFunction } from 'chat-list/types/chat';
import getFunctions from './prompts/functions'


export const buildFunctionModeMessages = async (requirements: string, tableData: string[][]) => {
  const prompt = template(systemFunction, {
    requirements,
    tableData: JSON.stringify(tableData, null, 2)
  })
  const context = {
    role: 'system',
    content: prompt
  }

  return [
    context, {
      role: 'user',
      content: requirements
    }
  ]
}


export const buildHightlightFunctionMessage = async (input: string): Promise<{
  messages: IMessageBody[],
  tools: ToolFunction[],
}> => {
  const tools: ToolFunction[] = getFunctions();

  const context: IMessageBody[] = [
    {
      role: 'system',
      content: `You need to help the user to call filter function to filter data .`
    },
    {
      role: 'user',
      content: `Filter conditon: ${input}
      `
    }]

  const messages: IMessageBody[] = context;
  return {
    messages,
    tools
  }

}