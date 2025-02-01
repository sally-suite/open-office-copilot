
import description from './description.md'
import { ChatState, ITool } from 'chat-list/types/plugin';
import api from '@api/slide'
import { generateCatalog, generatePage } from './util';
import { ISlideItem } from 'chat-list/types/api/slide';
// import pptData from './ppt.json'
import { buildChatMessage, getImgSize, proxyImage, searchImage } from 'chat-list/utils';
import CardSlideImages from 'chat-list/components/card-slide-images';
import React from 'react';
import imageStore from 'chat-list/utils/image'

// import creaetLayoutPrompt from './prompts/create-layout.md'
// import { chatByPrompt } from 'chat-list/service/message';
// import { template } from 'chat-list/utils';
export const func = async ({ reference, is_add_image, page_num, context }: { reference: string, page_num: number, is_add_image: boolean, is_use_search: boolean, context: ChatState }) => {
    // 生成大纲
    // 根据大纲生成每页内容和配图建议
    // 根据配图建议生成内容
    const { appendMsg } = context;
    const slideElements: ISlideItem[] = [];
    // 三页以内不生成首页和Overview 
    if (page_num <= 3) {
        const result = await generatePage(reference);
        const items = result?.slides || [];
        for (let i = 0; i < items.length; i++) {
            const page = items[i];
            let size
            let imageBase64;
            if (page.image) {
                if (!page.image.startsWith('data:image')) {
                    const base64Img = imageStore.get(page.image);
                    if (base64Img) {
                        imageBase64 = base64Img;
                    }
                } else {
                    imageBase64 = page.image;
                }
                size = await getImgSize(imageBase64)
            }
            slideElements.push({
                type: 'page',
                title: page.title,
                text: page.content,
                list: page.list,
                notes: page.speaker_notes,
                image: {
                    src: imageBase64,
                    width: size?.width,
                    height: size?.height
                }
            })
        }
    } else {
        const catalog = await generateCatalog(reference, page_num)
        // const catalog = pptData;
        // console.log('catelog', catalog)
        const title = catalog.title_slide?.title;
        const subTitle = catalog.title_slide?.subtitle;
        const slides = catalog.contents_slide?.slides || []
        slideElements.push({
            type: 'cover',
            title: title,
            subtitle: subTitle,
        })
        slideElements.push({
            type: 'overview',
            title: title,
            text: catalog.overview_slide?.content
        })
        for (let i = 0; i < slides.length; i++) {
            const page = slides[i];
            try {
                // const page = await generatePage(catalog.overview_slide.description, slide.title, slide.description);
                let images: string[] = []
                if (is_add_image) {
                    images = await searchImage(page.content, 4)
                    appendMsg(buildChatMessage(<CardSlideImages title={page.title} images={images} />, 'card', 'assistant'))
                }
                let size;
                let imageBase64;
                for (let i = 0; i < images.length; i++) {
                    const image = await proxyImage(images[i]);
                    if (!image) {
                        continue;
                    }
                    size = await getImgSize(image)
                    imageBase64 = image
                    break;
                }
                slideElements.push({
                    type: 'page',
                    title: page.title,
                    text: page.content,
                    list: page.list,
                    notes: page.speaker_notes,
                    image: {
                        src: imageBase64,
                        width: size?.width,
                        height: size?.height
                    }
                })
            } catch (e) {
                continue;
            }
        }

    }

    await api.generateSlide(slideElements);

    return "Task completed,tell user to choose a favorite layout in PPT,and select the right images from preview image list.";
}

export default {
    type: 'function',
    name: 'generate_presentation',
    description,
    parameters: {
        "type": "object",
        "properties": {
            "reference": {
                "type": "string",
                "description": `References from context`
            },
            "is_add_image": {
                "type": "boolean",
                "description": `Set to true if the user wants to add image, default value is true.`
            },
            // "is_use_search": {
            //     "type": "boolean",
            //     "description": `Default is false, set to true if the user wants to use a search engine.`
            // },
            "page_num": {
                "type": "number",
                "description": `Number of pages of PPT to generate, default is 3`
            }
        },
        "required": [
            "reference",
            "is_add_image",
            // "is_use_search",
            "page_num"
        ]
    },
    func
} as unknown as ITool;

