



import { ChatState, ITool } from 'chat-list/types/plugin';
import descriptiont from './description.md'
import docApi from '@api/email'
import { IChatMessage } from 'chat-list/types/message';
// import { chatByPrompt } from 'chat-list/service/message';

export const main: ITool['func'] = async ({ message, context }: { message: IChatMessage, context: ChatState }): Promise<any> => {
    // const { showMessage } = context;
    const text = await docApi.getSelectedText();
    const email = await docApi.getDocumentContent();
    const history = text || email;
    if (!history) {
        return `No email content is selected, tell user to  select email content.`;
    }
    return `Email content:\n\n ${history}`;
}

export default {
    "name": "get_email_content",
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