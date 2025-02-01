import { chatByPrompt, chatByTemplate } from 'chat-list/service/message'
import cataLogPrompt from './prompts/create-catalog.md'
import createPagePrompt from './prompts/create-page.md'
import { blobToBase64, extractJsonDataFromMd, template } from 'chat-list/utils'
import api from "@api/index";
import { ImageSearchResult, SearchResult } from 'chat-list/types/search';
import { Document, HeadingLevel, ImageRun, Packer, Paragraph, TextRun } from 'docx'
// import { saveAs } from "file-saver";

export interface IDocElement {
    title: string,
    subtitle?: string,
    paragraphs?: string[],
    images?: {
        src: string,
        alt: string,
        width: number,
        height: number,
    }[]
}

export interface ICatalog {
    cover: {
        title: string;
        subtitle: string;
        author: string;
    };
    overview: {
        title: string;
        content: string;
    };
    chapters: {
        title: string;
        description: string;
    }[];
    summary: {
        title: string;
        content: string,
        keywords: string[]
    }
}


export const generateCatalog = async (input: string, language: string): Promise<ICatalog> => {
    const result = await await chatByTemplate(cataLogPrompt, {
        user_requirements: input,
        language
    }, {
        temperature: 0.8,
        max_tokens: 3000,
        // response_format: { "type": "json_object" },
    })
    return extractJsonDataFromMd(result.content)
}


export interface ISlidePage {
    title: string;
    paragraphs: string[];
    list: string[];
    image?: string;
    speaker_notes: string;
    image_search_keywords: string;
}

export const generatePage = async (title: string, description: string, catalog: string, reference: string, word_count: number, language: string): Promise<ISlidePage> => {
    const result = await chatByTemplate(createPagePrompt, {
        title,
        description,
        word_count: word_count + '',
        catalog,
        reference: reference || 'no reference',
        language
    }, {
        temperature: 0.8,
        max_tokens: 3000,
        // response_format: { "type": "json_object" },
    })
    return extractJsonDataFromMd(result?.content)
}


export const searchContent = async (keyword: string) => {
    const results = await api.search({
        keyword
    }) as SearchResult[];
    const targets = results.filter(p => p.content);
    if (targets.length == 0) {
        return ''
    }
    const reply = targets.map((item) => {
        return `## ${item.title}\n\n${item.content}`
    }).join('\n\n');

    return reply;
}

export const createDoc = async (elements: IDocElement[]) => {
    const cover = elements[0];
    const ps = elements.slice(1);
    const paragraphs: any[] = [];
    ps.forEach((el) => {
        paragraphs.push(new Paragraph({
            text: el.title,
            heading: HeadingLevel.HEADING_1
        }));
        el?.paragraphs?.forEach((p) => {
            paragraphs.push(new Paragraph({
                text: p,
                style: "normal",
            }));
        })
        el?.images?.forEach((img) => {
            const width = 600;
            const height = width / img.width * img.height;
            paragraphs.push(new Paragraph({
                children: [
                    new ImageRun({
                        data: img.src,
                        transformation: {
                            width,
                            height
                        }
                    })
                ]
            }));
        })
    })
    const doc = new Document({
        styles: {
            paragraphStyles: [
                {
                    id: "Heading1",
                    name: "Heading 1",
                    basedOn: "Normal",
                    next: "Normal",
                    quickFormat: true,
                    run: {
                        size: 28,
                        bold: true,
                        color: "#000000",
                    },
                    paragraph: {
                        spacing: {
                            after: 240,
                        },
                    },
                },
                {
                    id: "normal",
                    name: "Normal",
                    basedOn: "Normal",
                    next: "Normal",
                    paragraph: {
                        spacing: {
                            before: 120,
                            after: 120,
                            line: 300,
                        },
                    },
                },
            ]
        },
        sections: [{
            properties: {},
            children: [
                new Paragraph({
                    text: cover.title,
                    heading: HeadingLevel.TITLE
                }),
                new Paragraph({
                    text: cover.subtitle,
                }),
                ...paragraphs
            ],
        }],
    });
    // Packer.toBlob(doc).then(blob => {
    //     console.log(blob);
    //     // saveAs(blob, "example.docx");
    //     console.log("Document created successfully");
    // });
    return await Packer.toBlob(doc);
}
