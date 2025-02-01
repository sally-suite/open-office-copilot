import { IMessageBody, Role } from "chat-list/types/chat";
import { IChatMessage } from "chat-list/types/message";
import { IChatPlugin } from "chat-list/types/plugin";
import { memoize, removeMentions } from "chat-list/utils";
/**
 * 带废弃
 * @param messages 
 * @param role 
 * @param content 
 * @param prompt 
 * @returns 
 */
export const buildChatMessages = async (
  messages: IChatMessage[],
  role: Role,
  content: string,
  prompt?: string
): Promise<IMessageBody[]> => {
  let list: IMessageBody[] = (messages as IChatMessage[])
    .filter(
      (p) =>
        (p.type === 'text' || p.type === 'file') && (p.role === 'assistant' || p.role === 'user')
    )
    .filter((p) => p.content)
    .slice(-10)
    .map((item) => {
      return {
        role: item.role,
        content: removeMentions(item.content),
      } as IMessageBody;
    });

  if (content) {
    list = list.concat([
      {
        role,
        content,
      },
    ]);
  }
  if (!prompt) {
    return list as IMessageBody[];
  }
  const msgList = [
    {
      role: 'system',
      content: prompt,
    } as IMessageBody,
  ].concat(list) as IMessageBody[];
  return msgList;
};

export const buildContextChatMessages = async (
  messages: IChatMessage[],
  prompt?: string
): Promise<IMessageBody[]> => {
  const list: IMessageBody[] = (messages as IChatMessage[])
    .filter((p) => typeof p.content === 'string' && p.content)
    .slice(-10)
    .map((item) => {
      return {
        role: item.role,
        content: removeMentions(item.content),
      } as IMessageBody;
    });

  if (!prompt) {
    return list as IMessageBody[];
  }
  const msgList = [
    {
      role: 'system',
      content: prompt,
    } as IMessageBody,
  ].concat(list) as IMessageBody[];
  return msgList;
};

export const buildPluginFunctions = memoize((plugins: IChatPlugin[]) => {
  return plugins.filter(p => p.action !== 'start' && p.action !== 'sally').map((plug) => {
    return {
      name: plug.action,
      description: plug.description,
      parameters: plug.parameters || {
        "type": "object",
        "properties": {
          "content": {
            "type": "string",
            "description": `User input message`
          },
        },
        "required": [
        ]
      }
    }
  })
});

export const buildPluginTools = memoize((plugins: IChatPlugin[]) => {
  const excludes = ['start', 'sally', 'vision', 'flow', 'analyst'];
  return plugins.filter(p => !excludes.includes(p.action)).map((plug) => {
    return {
      type: 'function',
      function: {
        name: plug.action,
        description: plug.instruction,
        parameters: plug.parameters || {
          "type": "object",
          "properties": {
            "content": {
              "type": "string",
              "description": `User input message`
            },
          },
          "required": [
          ]
        }
      }
    }
  })
});

