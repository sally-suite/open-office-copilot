import { chatByPrompt, chatByTemplate } from 'chat-list/service/message'
import cataLogPrompt from './prompts/create-catalog.md'
import createPagePrompt from './prompts/create-page.md'
import { blobToBase64, extractJsonDataFromMd, template } from 'chat-list/utils'
import api from "@api/index";
import { ImageSearchResult, SearchResult } from 'chat-list/types/search';

interface Presentation {
    title: string;
    subtitle: string;
    overview: string;
    table_of_contents: string[];
    sections: Section[];
}

interface Slide {
    title: string;
    list: ContentItem[];
}

interface Section {
    title: string;
    description: string;
    slides: Slide[];
}

interface ContentItem {
    title: string;
    description: string;
}




export const generateCatalog = async (input: string, pageNum: string, language: string): Promise<Presentation> => {
    const result = await await chatByTemplate(cataLogPrompt, {
        user_powerpoint_requirements: input,
        page_num: pageNum + '',
        language
    }, {
        temperature: 0.8,
        max_tokens: 3000,
        response_format: { "type": "json_object" },
    })
    return extractJsonDataFromMd(result.content)
}


export interface ISlidePage {
    title: string;
    description: string;
    slides: {
        title: string;
        list: {
            title: string;
            description: string;
        }[];
        speaker_notes: string;
        image_search_keywords: string;
    }[];
}

export const generatePage = async (title: string, description: string, slides: Slide[], reference: string, language: string): Promise<ISlidePage> => {
    const result = await chatByTemplate(createPagePrompt, {
        title,
        description,
        slides: JSON.stringify(slides, null, 2),
        reference: reference || 'no reference',
        language
    }, {
        temperature: 0.8,
        max_tokens: 3000,
        response_format: { "type": "json_object" },
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