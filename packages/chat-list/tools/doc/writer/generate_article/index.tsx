
import description from './description.md'
import { ChatState, ITool } from 'chat-list/types/plugin';
import docApi from '@api/doc'
import { generateCatalog, generatePage } from './util';
// import pptData from './ppt.json'
import { buildChatMessage, getImgSize, proxyImage, searchImage } from 'chat-list/utils';
import CardSlideImages from 'chat-list/components/card-slide-images';
import React from 'react';
// import imageStore from 'chat-list/utils/image'
import { IChatMessage } from 'chat-list/types/message';
import { searchStore } from 'chat-list/utils/vertor'
import { IChapterItem } from 'chat-list/types/api/doc';
import catelogData from './catelog.json'
import pageData from './pagedata.json'
import serApi from "@api/index";
import { SearchResult } from 'chat-list/types/search';
import image from 'chat-list/utils/image';

// import creaetLayoutPrompt from './prompts/create-layout.md'
// import { chatByPrompt } from 'chat-list/service/message';
// import { template } from 'chat-list/utils';
export const func = async ({ reference, webpage_urls = [], is_add_image = true, message, word_count = 500, language, context }: {
    reference: string,
    webpage_urls: string[],
    message: IChatMessage,
    language: string,
    word_count: number,
    is_add_image: boolean,
    is_use_search: boolean,
    context: ChatState
}) => {
    // 生成大纲
    // 根据大纲生成每页内容和配图建议
    // 根据配图建议生成内容
    const { appendMsg, setTyping, updateMsg } = context;
    // const slideElements: ISlideItem[] = [];
    // 三页以内不生成首页和Overview 
    let fileId = '', fileContent = '';
    // let wordCount = word_count + '';
    if (message?.files && message?.files.length > 0) {
        fileId = message.files[0].name;
        fileContent = message.content;
    }

    if (webpage_urls && webpage_urls.length > 0) {
        fileId = webpage_urls.join(',');
        try {
            const ps = await Promise.all(webpage_urls.map(async (url) => {
                const results = await serApi.search({
                    keyword: url
                }) as SearchResult[];
                return results.map(r => (r.content || r.snippet)).join('\n')
            }))
            fileContent += ps.join('\n')
        } catch (e) {
            console.log(e)
            // return "Searching for web content failed, please try another web link.";
        }
    }
    debugger;
    const catalog = await generateCatalog(reference, language)
    // const catalog = pptData;
    // console.log('catelog', catalog)
    const title = catalog.cover?.title;
    const subTitle = catalog.cover?.subtitle;
    const slides = catalog?.chapters || [];
    let mark = '';
    const articleMessage = buildChatMessage('', 'text', 'assistant');
    const messageId = articleMessage._id;
    appendMsg(articleMessage);

    mark += `# ${title}`
    mark += `\n## ${subTitle}`
    articleMessage.content = mark;
    updateMsg(messageId, articleMessage)
    await docApi.insertTitle(title, 0)
    await docApi.insertTitle(subTitle, 0.5)

    mark += `\n## ${catalog.overview.title}`
    mark += `\n ${catalog.overview.content}`
    articleMessage.content = mark;
    updateMsg(messageId, articleMessage)

    await docApi.insertParagraph('')
    await docApi.insertParagraph(catalog.overview.content)
    await docApi.insertParagraph('')

    const wordCount = Math.round(word_count / slides.length);
    for (let i = 0; i < slides.length; i++) {
        setTyping(true)
        const item = slides[i];
        try {
            let refer = 'NONE';
            if (fileId && fileContent) {
                // const result = await searchStore(fileId, fileContent, item.description, 3)
                // refer = result.join('\n');
                refer = fileContent;
            }

            const page = await generatePage(item.title, item.description, JSON.stringify(catalog, null, 2), refer, wordCount, language);
            // console.log(page)
            let images: string[] = []
            if (is_add_image && page.image_search_keywords) {
                images = await searchImage(page.image_search_keywords, 4)
                // appendMsg(buildChatMessage(<CardSlideImages title={page.title} images={images} />, 'card', 'assistant'))
            }
            let size;
            let imageBase64;
            try {
                for (let i = 0; i < images.length; i++) {
                    const image = await proxyImage(images[i]);
                    if (!image) {
                        continue;
                    }
                    size = await getImgSize(image)
                    imageBase64 = image
                    break;
                }
            } catch (e) {
                console.log(e)
            }
            await docApi.insertParagraph('')
            await docApi.insertTitle(page.title, 1)
            await docApi.insertParagraph(page.paragraphs)

            mark += `\n## ${page.title}`
            mark += `\n ${page.paragraphs?.join('\n\n')}`

            articleMessage.content = mark;
            updateMsg(messageId, articleMessage)

            mark += images?.map((img) => { return `![${page.title}](${img})` })?.join('\n') || '';

            articleMessage.content = mark;
            updateMsg(messageId, articleMessage);

            if (imageBase64) {
                await docApi.insertImage(imageBase64, size?.width, size?.height, "", "", "End");
            }
            await docApi.insertParagraph('')

        } catch (e) {
            console.log(e)
            continue;
        }
    }

    await docApi.insertParagraph('')
    await docApi.insertTitle(catalog.summary.title, 1)
    await docApi.insertParagraph(catalog.summary.content)
    await docApi.insertParagraph('')
    await docApi.insertParagraph(catalog.summary?.keywords?.join(', '))

    mark += `\n## ${catalog.summary.title}`
    mark += `\n ${catalog.summary.content}`
    mark += '\n';
    mark += `\n ${catalog.summary?.keywords?.join(', ')}`
    // appendMsg(buildChatMessage(mark, 'text', 'assistant'));
    articleMessage.content = mark;
    updateMsg(messageId, articleMessage);

    return "Task completed, tell the user to please select the appropriate image, and the article is AI-generated and is not guaranteed to be accurate, so please be sure to proofread.";
}

export default {
    type: 'function',
    name: 'generate_article',
    description,
    parameters: {
        "type": "object",
        "properties": {
            "reference": {
                "type": "string",
                "description": `References from context, not include web link.`
            },
            "webpage_urls": {
                "type": 'array',
                "description": `Webpage urls from context or reference,can be empty array.`,
                "items": {
                    "type": "string"
                }
            },
            "word_count": {
                "type": "number",
                "description": `Default is 1000, set to a number to limit the number of words in the generated content.`
            },
            "is_add_image": {
                "type": "boolean",
                "description": `Default is true, set to true if the user wants to add image.`
            },
            "language": {
                "type": "string",
                "description": `Language of the Article`
            }
        },
        "required": [
            "reference",
            "webpage_urls",
            "is_add_image",
            "language"
        ]
    },
    func
} as unknown as ITool;

