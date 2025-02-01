import { template } from 'chat-list/utils';
import systemFunction from './prompts/system-function.md';
import { IMessageBody, ToolFunction } from 'chat-list/types/chat';
import getFunctions from './prompts/functions'


export const buildFunctionModeMessages = async (data: string[][]) => {
  const prompt = template(systemFunction, {
    tableData: JSON.stringify(data)
  })
  return prompt;
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