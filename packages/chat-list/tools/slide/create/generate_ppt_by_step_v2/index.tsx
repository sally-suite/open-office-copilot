
import description from './description.md';
import { ChatState, ITool } from 'chat-list/types/plugin';
import { generateCatalog, generatePage } from './util';
import { ISlideItem } from 'chat-list/types/api/slide';
// import pptData from './ppt.json'
import { buildChatMessage, getImgSize, proxyImage, searchImage } from 'chat-list/utils';
import CardSlideImages from 'chat-list/components/card-slide-images';
import React from 'react';
// import imageStore from 'chat-list/utils/image'
import { IChatMessage } from 'chat-list/types/message';
import CardSlideRender from 'chat-list/components/card-slide-render';
// import creaetLayoutPrompt from './prompts/create-layout.md'
// import { chatByPrompt } from 'chat-list/service/message';
// import { template } from 'chat-list/utils';
export const func = async ({ reference, message, is_add_image, language, page_num, context }: { reference: string, message: IChatMessage, language: string, page_num: number, is_add_image: boolean, is_use_search: boolean, context: ChatState }) => {
    // 生成大纲
    // 根据大纲生成每页内容和配图建议
    // 根据配图建议生成内容
    const { appendMsg, setTyping, platform } = context;
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
    const catalog = await generateCatalog(reference + '\n\n' + fileContent, pageNum, language);
    // const catalog = pptData;
    console.log('catelog', catalog);
    const title = catalog.title;
    const subTitle = catalog.subtitle;
    const sections = catalog.sections;

    // if (page_num > 3) {
    //     await api.generateSlide([{
    //         type: 'cover',
    //         title: title,
    //         subtitle: subTitle,
    //     }, {
    //         type: 'overview',
    //         title: title,
    //         text: catalog.overview
    //     }])
    // }

    const slideElements: ISlideItem[] = [];
    slideElements.push({
        type: 'cover',
        title: title,
        subtitle: subTitle,
    }, {
        type: 'overview',
        title: title,
        text: catalog.overview
    });

    for (let i = 0; i < sections.length; i++) {
        setTyping(true);
        const item = sections[i];
        try {
            const refer = fileContent;
            // if (fileId && fileContent && fileContent.length > 1000) {
            //     const result = await searchStore(fileId, fileContent, item.description, 3)
            //     refer = result.join('\n');
            // }
            const slide = await generatePage(item.title, item.description, item.slides, refer, language);
            const sections = item.slides.map(p => {
                return {
                    title: p.title,
                    description: ''
                };
            });
            slideElements.push({
                type: 'section',
                title: slide.title,
                text: slide.description,
                list: sections,
            });
            const pages = slide.slides;
            for (let j = 0; j < pages.length; j++) {
                const page = pages[j];
                let images: string[] = [];
                if (is_add_image) {
                    images = await searchImage(page.image_search_keywords, 4);
                    appendMsg(buildChatMessage(<CardSlideImages title={page.title} images={images} />, 'card', 'assistant'));
                }
                setTyping(true);
                let size;
                const imageList = [];
                let n = 0;
                for (let i = 0; i < images.length; i++) {
                    const image = await proxyImage(images[i]);
                    if (!image) {
                        continue;
                    }
                    size = await getImgSize(image);
                    imageList.push({ src: image, width: size?.width, height: size?.height });
                    n += 1;
                    if (n >= 3) {
                        break;
                    }
                }
                slideElements.push({
                    type: 'slide',
                    title: page.title,
                    list: page.list,
                    notes: page.speaker_notes,
                    image: imageList
                });
                // if (slideElements.length >= 2) {
                //     await api.generateSlide(slideElements);
                //     slideElements = [];
                // }
            }

        } catch (e) {
            continue;
        }
    }
    if (slideElements.length > 0) {
        // await api.generatePresentation({
        //     slides: slideElements,
        //     metadata: {
        //         title: title,
        //         subject: subTitle,
        //         author: 'Your Name',
        //         company: 'Your Company',
        //     }
        // });
        console.log('slideElements', slideElements);
        const msg = buildChatMessage(
            <CardSlideRender
                slideData={slideElements}
                metadata={{
                    title: title,
                    subject: subTitle,
                    author: 'Your Name',
                    company: 'Your Company',
                }} />
            , 'card', 'assistant');
        appendMsg(msg);
    }
    if (platform === 'google') {
        if (is_add_image) {
            return `Task completed,tell user to select the right images and Themes to make it more attractive, and the Presentation is AI-generated and is not guaranteed to be accurate, so please be sure to proofread.`;
        } else {
            return `Task completed,tell user to select right Themes to make it more attractive, and the Presentation is AI-generated and is not guaranteed to be accurate, so please be sure to proofread.`;
        }
    }

    if (is_add_image) {
        return `Task completed,tell user to select the right images from image list,and use designer of Powerpoint to make it more attractive, and the Presentation is AI-generated and is not guaranteed to be accurate, so please be sure to proofread.`;
    }
    return `Task completed,tell user to use designer of Powerpoint to make it more attractive, and the Presentation is AI-generated and is not guaranteed to be accurate, so please be sure to proofread.`;

};

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
                "description": `Default is true, set to true if the user wants to add image.`
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
            "reference",
            "is_add_image",
            // "is_use_search",
            "page_num",
            "language"
        ]
    },
    func
} as unknown as ITool;

