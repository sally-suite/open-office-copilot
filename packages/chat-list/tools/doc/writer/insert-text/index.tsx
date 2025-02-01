



import { ITool } from 'chat-list/types/plugin';
import docApi from '@api/doc'
import { ChatState } from "chat-list/types/plugin";
import { buildHtml } from 'chat-list/utils';

// import getSelectTextDesc from './get-selected-text.md'
export const main: ITool['func'] = async ({ text, context }: { text: string, context: ChatState }): Promise<any> => {

    const { platform } = context;
    if (platform == 'office') {
        await docApi.insertText(text, { type: 'text' });
    } else if (platform == 'google') {
        const html = await buildHtml(text, true);
        await docApi.insertText(html, { text, type: 'html' });
    } else {
        await docApi.insertText(text, { type: 'text' });
    }
    return 'Task done.'
}

export default {
    "name": "insert_text",
    "description": "Write text to document at cursor position in markdown format.",
    "parameters": {
        "type": "object",
        "properties": {
            "text": {
                "type": "string",
                "description": "Text to write to document in markdown format, support mermaid diagram, formula in latex format"
            }
        },
        "required": [
            "text"
        ]
    },
    func: main
} as unknown as ITool;