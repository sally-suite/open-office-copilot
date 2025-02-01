



import { ITool } from 'chat-list/types/plugin';
import docApi from '@api/doc';
// import getSelectTextDesc from './get-selected-text.md'
export const main: ITool['func'] = async (): Promise<any> => {
    const text = await docApi.getSelectedText();
    return text;
};

export default {
    "name": "get_selected_text",
    "description": "Gets the selected text if the user wants to process it,such as make long for selected text,check spelling for selectd text,etc.",
    "parameters": {
        "type": "object",
        "properties": {},
        "required": []
    },
    func: main
} as unknown as ITool;