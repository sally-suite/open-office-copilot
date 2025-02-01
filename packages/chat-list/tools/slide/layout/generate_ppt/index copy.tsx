
import description from './description.md'
import { ChatState, ITool } from 'chat-list/types/plugin';
import CardSlideLayout from 'chat-list/components/card-slide-layout';
import { buildChatMessage } from 'chat-list/utils';
import api from '@api/slide'
import React from 'react';
// import creaetLayoutPrompt from './prompts/create-layout.md'
// import { chatByPrompt } from 'chat-list/service/message';
// import { template } from 'chat-list/utils';
export const func = async ({ title, sub_title, description, elements, context }: { title: string, sub_title: string, description: string, elements: any[], context: ChatState }) => {
    const { appendMsg } = context

    // const prompt = template(creaetLayoutPrompt, {
    //     user_input: content,
    // })
    // const result = await chatByPrompt(prompt, null, { temperature: 0.7, stream: false });

    // return result.content;
    appendMsg(buildChatMessage(JSON.stringify(elements, null, 2), 'text', 'assistant'));

    appendMsg(buildChatMessage(<CardSlideLayout elements={elements} />, 'card', 'assistant'));
    const items = elements.reduce(() => { })
    return JSON.stringify(elements, null, 2);
}

export default {
    type: 'function',
    name: 'generate_layout',
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
            "elements": {
                "type": "array",
                "description": `Layout elements,use abosolute position to layout`,
                "items": {
                    "type": "object",
                    "properties": {
                        "type": {
                            "type": "string",
                            "description": `Layout element type, including title,list,image,text`
                        },
                        "top": {
                            "type": "number",
                            "description": `Top value in absolute layout`
                        },
                        "left": {
                            "type": "number",
                            "description": `Left value in absolute layout`
                        },
                        "width": {
                            "type": "number",
                            "description": "Width of element"
                        },
                        "height": {
                            "type": "number",
                            "description": "Height of element"
                        },
                        "title": {
                            "type": "string",
                            "description": `Title content in element type title`
                        },
                        "list": {
                            "type": "array",
                            "description": "List content in element type list",
                            "items": {
                                "type": "string",
                                "description": "List item"
                            }
                        },
                        "text": {
                            "type": "string",
                            "description": `Text content in element type text`
                        },
                        "image": {
                            "type": "string",
                            "description": `Image link in element type image`
                        },
                    },
                    "required": [
                        "type",
                        "top",
                        "left",
                        "width",
                        "height"
                    ]
                }
            }
        },
        "required": ['title', 'sub_title', 'description', 'elements']
    },
    func
} as unknown as ITool;

