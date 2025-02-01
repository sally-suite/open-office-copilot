



import { ITool } from 'chat-list/types/plugin';
import docApi from '@api/doc';
export const main: ITool['func'] = async (): Promise<any> => {
    const text = await docApi.getDocumentContent();
    return text;

};

export default {
    "name": "get_page_content",
    "description": "Get web page content if the user wants to process it,such as: summarize, translate, make titles, ask some questions,etc.",
    "parameters": {
        "type": "object",
        "properties": {},
        "required": []
    },
    func: main
} as unknown as ITool;