
import description from './description.md'
import { ChatState, ITool } from 'chat-list/types/plugin';
import { generatePage } from './util';
import { getImageSizeByBatch, searchImage } from 'chat-list/utils';
import slideApi from '@api/slide'
import React from 'react';
import CardSlideRender from 'chat-list/components/card-slide-render';


export const func = async ({ from_page, to_page, language, context }: { from_page: string, to_page: string, language: string, context: ChatState }) => {

    const { setTyping, showMessage } = context;
    const slides = await slideApi.getSlides(false);
    let start = 0, end = slides.length - 1;

    if (from_page && Number(from_page) > 0) {
        start = Number(from_page) - 1;
        end = start;
    }
    if (to_page && Number(to_page) > 0) {
        end = Number(to_page) - 1;
    }

    const slideImages: any[] = [];
    let slideElements: any[] = [];
    let msg = null;
    for (let i = start; i <= end; i++) {
        const item = slides[i];
        setTyping(true);
        const result = await slideApi.getSlidesText(item.id);
        for (let j = 0; j < result.length; j++) {
            const { id, texts } = result[j];
            const description = texts.join('\n');
            const page = await generatePage(description, language);

            const images = await searchImage(page.image_search_keywords + ' png jpeg', 4)
            slideImages.push({ title: page.title, images })
            setTyping(true)
            let imageList = await getImageSizeByBatch(images.slice(0, 5));
            if (imageList.length < 4) {
                const others = await getImageSizeByBatch(images.slice(5, 10));
                imageList = imageList.concat(others)
            }
            slideElements = slideElements.concat([
                {
                    type: 'list',
                    title: page.title,
                    text: page.content,
                    list: page.list,
                    notes: page.speaker_notes,
                    image: imageList.map((item) => {
                        return {
                            src: item.src,
                            width: item.width,
                            height: item.height
                        }
                    })
                }
            ])
            if (!msg) {
                msg = showMessage(
                    <CardSlideRender
                        status={'done'}
                        slideData={slideElements}
                        slideImages={slideImages}
                        metadata={{
                            title: '',
                            subject: '',
                            author: 'Your Name',
                            company: 'Your Company',
                        }} />
                    , 'assistant', 'card')
            } else {
                msg.update(
                    <CardSlideRender
                        status={'done'}
                        slideData={slideElements}
                        slideImages={slideImages}
                        metadata={{
                            title: '',
                            subject: '',
                            author: 'Your Name',
                            company: 'Your Company',
                        }} />
                )
            }
        }
    }

    return "Task completed, please let user check the generated slides and insert the slide into the presentation, and the slide is AI-generated and is not guaranteed to be accurate, so please be sure to proofread";

}

export default {
    type: 'function',
    name: 'optimize_slide',
    description,
    parameters: {
        "type": "object",
        "properties": {
            "from_page": {
                "type": "string",
                "description": `Generate from page number,default is empty`
            },
            "to_page": {
                "type": "string",
                "description": `Generate to page,default is empty`
            },
            "language": {
                "type": "string",
                "description": `Language of the PPT`
            }
        },
        "required": [
            "from_page",
            "to_page",
            'language'
        ]
    },
    func
} as unknown as ITool;

