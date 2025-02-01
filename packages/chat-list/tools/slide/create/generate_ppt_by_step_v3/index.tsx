
import description from './description.md'
import { ChatState, ITool } from 'chat-list/types/plugin';
import { generateCatalog } from './util';
// import pptData from './ppt.json'
import { buildChatMessage } from 'chat-list/utils';
import React from 'react';
// import imageStore from 'chat-list/utils/image'
import { IChatMessage } from 'chat-list/types/message';
import CardCatalogConfirm from 'chat-list/components/card-catalog-confirm';

interface ISlideParam {
    outline: string, message: IChatMessage, language: string,
    page_num: number, is_add_image: boolean, is_use_search: boolean,
    context: ChatState
}
export const func = async ({ outline, message, is_add_image, language, page_num, context }: ISlideParam) => {

    const { appendMsg } = context;
    // const slideElements: ISlideItem[] = [];
    // 三页以内不生成首页和Overview 
    let fileId = '', fileContent = '';
    let pageNum = page_num + '';
    if (message?.files && message?.files.length > 0) {
        fileId = message.files[0].name;
        fileContent = message.content;
        pageNum = 'Unlimited, determined based on document content';
    } else {
        fileId = 'input-message';
        fileContent = message.content;
    }

    const catalog = await generateCatalog(outline, fileContent, pageNum, language);

    const catalogMsg = buildChatMessage(
        <CardCatalogConfirm catalog={catalog} reference={outline + '\n\n' + fileContent} addImages={is_add_image} language={language} />, 'card', 'assistant');
    appendMsg(catalogMsg);

    return `TELL USER:"Please review the Outline above and click on Confirm to continue" DO NOT SAY OTHER CONTENT.`;

}

export default {
    type: 'function',
    name: 'generate_presentation',
    description,
    parameters: {
        "type": "object",
        "properties": {
            "outline": {
                "type": "string",
                "description": `The outline of slide, from user input or context,don't leave out contextual information`
            },
            "is_add_image": {
                "type": "boolean",
                "description": `Set to true if the user wants to add image, default is true`
            },
            // "is_use_search": {
            //     "type": "boolean",
            //     "description": `Default is false, set to true if the user wants to use a search engine.`
            // },
            "page_num": {
                "type": "number",
                "description": `Number of pages of PPT to generate, default is 5`
            },
            "language": {
                "type": "string",
                "description": `Language of the PPT`
            }
        },
        "required": [
            "description",
            "is_add_image",
            // "is_use_search",
            "page_num",
            "language"
        ]
    },
    func
} as unknown as ITool;

