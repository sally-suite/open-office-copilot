



import { ITool } from 'chat-list/types/plugin';
// import getSelectTextDesc from './get-selected-text.md'
export const main: ITool['func'] = async (): Promise<any> => {
    // 先检查Article 标签
    const article = document.querySelector('article');
    if (article) {
        return article.innerText;
    }
    // 再检查 main 标签
    const main = document.querySelector('main');
    if (main) {
        return main.innerText;
    }
    return document.body.innerText;
};

export default {
    "name": "get_page_selected_text",
    "description": "Gets the selected text if the user wants to process it,such as make long for selected text,check spelling for selectd text,etc.",
    "parameters": {
        "type": "object",
        "properties": {},
        "required": []
    },
    func: main
} as unknown as ITool;