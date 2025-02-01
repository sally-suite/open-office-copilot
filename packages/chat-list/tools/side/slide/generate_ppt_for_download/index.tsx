
import description from './description.md'
import { ChatState, ITool } from 'chat-list/types/plugin';
import { generateCatalog, generatePage } from './util';
import { ISlideItem } from 'chat-list/types/api/slide';
import { buildChatMessage, getImgSize, proxyImage, searchImage } from 'chat-list/utils';
import CardSlideImages from 'chat-list/components/card-slide-images';
import React from 'react';
import { IChatMessage } from 'chat-list/types/message';
import { searchStore } from 'chat-list/utils/vertor'
import { generateSlides } from 'chat-list/service/slide';
import CardDownload from 'chat-list/components/card-download-file'
export const func = async ({ reference, message, is_add_image, language, page_num, context }: { reference: string, message: IChatMessage, language: string, page_num: number, is_add_image: boolean, is_use_search: boolean, context: ChatState }) => {
    // 生成大纲
    // 根据大纲生成每页内容和配图建议
    // 根据配图建议生成内容
    const { appendMsg, setTyping, updateMsg } = context;
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
    const catalog = await generateCatalog(reference + '\n\n' + fileContent, pageNum, language)

    const title = catalog.title_slide?.title;
    const subTitle = catalog.title_slide?.subtitle;
    const slides = catalog.contents_slide?.slides || []
    const slideElements: ISlideItem[] = [];
    let mark = '';
    const articleMessage = buildChatMessage('', 'text', 'assistant');
    const messageId = articleMessage._id;
    appendMsg(articleMessage);

    slideElements.push({
        type: 'cover',
        title: title,
        subtitle: subTitle,
    })
    mark += `# ${title}\n## ${subTitle}`;
    slideElements.push({
        type: 'overview',
        title: title,
        text: catalog.overview_slide?.content
    })
    mark += `\n\n${catalog.overview_slide?.content}`;

    articleMessage.content = mark;
    updateMsg(messageId, articleMessage)

    for (let i = 0; i < slides.length; i++) {
        setTyping(true)
        const item = slides[i];
        try {
            const refer = fileContent;
            // if (fileId && fileContent && fileContent.length > 1000) {
            //     const result = await searchStore(fileId, fileContent, item.description, 3);
            //     refer = result.join('\n');
            // }
            const page = await generatePage(item.title, item.description, refer, language);
            let images: string[] = [];
            if (is_add_image) {
                images = await searchImage(page.image_search_keywords, 4);
                // appendMsg(buildChatMessage(<CardSlideImages title={page.title} images={images} />, 'card', 'assistant'))
            }
            setTyping(true)
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
            mark += `\n\n## ${page.title}\n\n${page.content}`;
            mark += `\n\n${page.list.map(item => `- ${item}`).join('\n')}`;
            // mark += `\n\n${page.speaker_notes}`
            mark += '\n\n';
            mark += images?.map((img) => { return `![${page.title}](${img})` })?.join('\n\n') || '';

            articleMessage.content = mark;
            updateMsg(messageId, articleMessage)
        } catch (e) {
            continue;
        }
    }

    const markBlob = new Blob([mark], { type: 'text/plain' });
    const markFile = new File([markBlob], `${title}.md`, { type: 'text/plain' });

    const file = await generateSlides(slideElements, { outputType: 'blob', download: true }) as Blob;
    // 在浏览器下载这个文件
    const pptFile = new Blob([file], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
    const newFile = new File([pptFile], `${title}.pptx`, { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });

    appendMsg(buildChatMessage(<CardDownload files={[newFile, markFile]} />, 'card', 'assistant'))

    return "Task completed,tell user to choose a favorite layout in PPT,and select the right images from image list,and the PPT is AI-generated and is not guaranteed to be accurate, so please be sure to proofread";

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
                "description": `Default is true, set to true if the user wants to add image.`
            },
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
            "page_num",
            "language"
        ]
    },
    func
} as unknown as ITool;

