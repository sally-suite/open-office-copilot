import { chatByPrompt, chatByTemplate } from 'chat-list/service/message'
import cataLogPrompt from './prompts/create-catalog.md'
import createPagePrompt from './prompts/create-page.md'
import { blobToBase64, extractJsonDataFromMd, template } from 'chat-list/utils'
import api from "@api/index";
import { ImageSearchResult, SearchResult } from 'chat-list/types/search';

export interface ICatalog {
    title_slide: {
        title: string;
        subtitle: string;
        author: string;
    };
    overview_slide: {
        content: string;
    };
    contents_slide: {
        slides: {
            title: string;
            content: string;
            list: string[];
            speaker_notes: string;
        }[];
    }
}

export const generateCatalog = async (input: string, pageNum: number): Promise<ICatalog> => {
    const result = await await chatByTemplate(cataLogPrompt, {
        user_powerpoint_requirements: input,
        page_num: pageNum + ''
    }, {
        temperature: 0.8,
        max_tokens: 3000,
        // response_format: { "type": "json_object" },
    })
    return extractJsonDataFromMd(result.content)
}


export interface ISlidePage {
    title: string;
    content: string;
    list: string[];
    image?: string;
    speaker_notes: string;
}

export const generatePage = async (input: string,): Promise<{ slides: ISlidePage[] }> => {
    const result = await chatByTemplate(createPagePrompt, {
        user_powerpoint_requirements: input,
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