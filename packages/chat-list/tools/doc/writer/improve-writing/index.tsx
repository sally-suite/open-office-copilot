



import { ChatState, ITool } from 'chat-list/types/plugin';
import descriptiont from './description.md'
import { chatByTemplate } from 'chat-list/service/message';
import { buildChatMessage } from 'chat-list/utils';
import { IChatResult } from 'chat-list/types/chat';
import docApi from '@api/doc'
import { IChatMessage } from 'chat-list/types/message';
import improveWriting from './improve-writing.md'

export const main: ITool['func'] = async ({ message, context }: { message: IChatMessage, context: ChatState }): Promise<any> => {
    const text = await docApi.getSelectedText();
    // if (!text) {
    //     return `No text selected`;
    // }
    // return text;
    // const { showMessage } = context;
    const input = text ? text + '\n\n' + message.content : message.content;
    // const resMsg = showMessage('', 'assistant');
    const result = await chatByTemplate(improveWriting, { input }, { stream: false, temperature: 0.8 });

    return `Output content to the user without adding extra text:${result.content}`;
}

export default {
    "name": "improve_writing",
    "description": descriptiont,
    "parameters": {
        "type": "object",
        "properties": {
            "empty": {
                "type": "string",
                "description": `empty`
            }
        },
        "required": [],
    },
    func: main
} as unknown as ITool;