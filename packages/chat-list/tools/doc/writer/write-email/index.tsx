



import { ChatState, ITool } from 'chat-list/types/plugin';
import descriptiont from './description.md'
import docApi from '@api/doc'
import { IChatMessage } from 'chat-list/types/message';

export const main: ITool['func'] = async ({ message, context }: { message: IChatMessage, context: ChatState }): Promise<any> => {
    const text = await docApi.getSelectedText();
    if (!text) {
        return `No email history is selected, tell user to  select email history.`;
    }
    return text;
}

export default {
    "name": "write_email",
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