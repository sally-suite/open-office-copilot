
import description from './description.md';
import { ChatState, ITool } from 'chat-list/types/plugin';
import CardSlideLayout from 'chat-list/components/card-slide-layout';
import { buildChatMessage, getImgSize } from 'chat-list/utils';
import api from '@api/slide';
import imageStore from 'chat-list/utils/image';
import React from 'react';
// import creaetLayoutPrompt from './prompts/create-layout.md'
// import { chatByPrompt } from 'chat-list/service/message';
// import { template } from 'chat-list/utils';
export const func = async ({ title, text, list, image_url, notes, context }: { title: string, text: string, image_url: string, list: string[], notes: string, context: ChatState }) => {
    // const { appendMsg } = context

    // const prompt = template(creaetLayoutPrompt, {
    //     user_input: content,
    // })
    // const result = await chatByPrompt(prompt, null, { temperature: 0.7, stream: false });

    // return result.content;
    // appendMsg(buildChatMessage(JSON.stringify(pages, null, 2), 'text', 'assistant'));

    // appendMsg(buildChatMessage(<CardSlideLayout elements={elements} />, 'card', 'assistant'));
    // const items = elements.reduce(() => { })
    let imgUrl = image_url;
    let imgdata = null;
    if (image_url) {
        if (!image_url.startsWith('data:image')) {
            const base64Img = imageStore.get(image_url);
            if (base64Img) {
                imgUrl = base64Img;
            }
        }
        try {
            const { width, height } = await getImgSize(imgUrl);
            const rate = 250 / width;
            const h = height * rate;
            imgdata = {
                src: imgUrl,
                width: 250,
                height: h
            };
        } catch (e) {
            imgdata = {
                src: imgUrl,
                width: 250,
                height: 250
            };
        }

    }
    await api.createPage(title, text, list, imgdata as any, notes);
    const ls = list.map((item) => {
        return `- ${item}`;
    }).join('\n');
    const img = `![${title}](${image_url})`;
    return `title:${title}\n\ntext:${text}\n\nlist:\n${ls}\n\nimage:${img}\n\nnotes:\n${notes}`;
};

export default {
    type: 'function',
    name: 'generate_presentation',
    description,
    parameters: {
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
                "description": "display data as a list",
                "items": {
                    "type": "string",
                    "description": "list item"
                }
            },
            "image_url": {
                "type": "string",
                "description": "image url"
            },
            "notes": {
                "type": "string",
                "description": "speaker notes"
            }
        },
        "required": [
            "title",
            "text",
            "list",
            "notes"
        ]
    },
    func
} as unknown as ITool;

