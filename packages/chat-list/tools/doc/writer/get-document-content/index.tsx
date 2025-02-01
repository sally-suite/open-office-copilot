



import { ChatState, ITool } from 'chat-list/types/plugin';
import docApi from '@api/doc'
import { searchStore } from 'chat-list/utils/vertor';
import { IChatMessage } from 'chat-list/types/message';
import { buildChatMessage } from 'chat-list/utils';
// import getSelectTextDesc from './get-selected-text.md'
export const main: ITool['func'] = async ({
    is_summarize = false,
    is_make_titles = false,
    is_ask_questions = false,
    is_translate,
    message,
    context
}: {
    is_summarize: boolean,
    is_make_titles: boolean,
    is_ask_questions: boolean,
    is_translate: boolean,
    message: IChatMessage,
    context: ChatState
}): Promise<any> => {
    const { appendMsg } = context;
    const content = message.content;

    const text = await docApi.getDocumentContent();

    // if (is_make_titles || is_summarize || is_translate) {
    //     if (text.length > 20000) {
    //         const texts = await searchStore('article', text, content, 3);
    //         if (texts.length > 0) {
    //             const result = texts.join('\n');
    //             return `# Reference:\n\n` + result;
    //         }
    //         return `# Reference:\n\n` + text;
    //     }
    //     return text;
    // }

    // let result = '';
    // if (text.length > 1500) {
    //     const texts = await searchStore('article', text, content, 3);
    //     if (texts.length > 0) {
    //         result = text;
    //     }
    //     result = texts.join('\n');
    //     // const refer = `#### Reference:\n\n` + result;
    //     // appendMsg(buildChatMessage(refer, 'text', 'assistant'));
    // } else {
    //     result = text;
    // }
    return `# Reference:\n\n` + text;
}

export default {
    "name": "get_document_content",
    "description": "Get all document content if the user wants to process it, such as: summarize, translate, make titles, ask some questions,etc.",
    "parameters": {
        "type": "object",
        "properties": {
            "is_summarize": {
                "type": "boolean",
                "description": "Whether user want to summarize the document"
            },
            "is_make_titles": {
                "type": "boolean",
                "description": "Whether user to make titles for the document"
            },
            "is_translate": {
                "type": "boolean",
                "description": "Whether user to translate the document"
            },
            "is_ask_questions": {
                "type": "boolean",
                "description": "Whether user to ask questions about the document detail"
            }
        },
        "required": [
            "is_summarize",
            "is_make_titles",
            "is_translate",
            "is_ask_questions"
        ]
    },
    func: main
} as unknown as ITool;