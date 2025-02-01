
import description from './description.md'
import { ChatState, ITool } from 'chat-list/types/plugin';
import CardSlideLayout from 'chat-list/components/card-slide-layout';
import { buildChatMessage } from 'chat-list/utils';
import api from '@api/slide'
import React from 'react';
// import creaetLayoutPrompt from './prompts/create-layout.md'
// import { chatByPrompt } from 'chat-list/service/message';
// import { template } from 'chat-list/utils';
export const func = async ({ title, sub_title, description, pages, context }: { title: string, sub_title: string, description: string, pages: any[], context: ChatState }) => {
    const { appendMsg } = context

    // const prompt = template(creaetLayoutPrompt, {
    //     user_input: content,
    // })
    // const result = await chatByPrompt(prompt, null, { temperature: 0.7, stream: false });

    // return result.content;
    appendMsg(buildChatMessage(JSON.stringify(pages, null, 2), 'text', 'assistant'));

    // appendMsg(buildChatMessage(<CardSlideLayout elements={elements} />, 'card', 'assistant'));
    // const items = elements.reduce(() => { })
    return JSON.stringify(pages, null, 2);
}

export default {
    type: 'function',
    name: 'generate_ppt',
    description,
    parameters: {
        "type": "object",
        "properties": {
            "title": {
                "type": "string",
                "description": "title of the presentation"
            },
            "description": {
                "type": "string",
                "description": "description of the presentation"
            },
            "sub_title": {
                "type": "string",
                "description": "sub title of the  presentation "
            },
            "pages": {
                "type": "array",
                "description": `Pages of the presentation`,
                "items": {
                    "type": "object",
                    "properties": {
                        "title": {
                            "type": "string",
                            "description": `title of this page`
                        },
                        "text": {
                            "type": "string",
                            "description": `text content`
                        },
                        "list": {
                            "type": "array",
                            "description": "list of items ",
                            "items": {
                                "type": "string",
                                "description": "list item"
                            }
                        }
                    },
                    "required": [
                        "title",
                        "text",
                        "list"
                    ]
                }
            }
        },
        "required": ['title', 'sub_title', 'description', 'pages']
    },
    func
} as unknown as ITool;

