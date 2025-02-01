import { chatByPrompt, chatByTemplate } from 'chat-list/service/message'
import cataLogPrompt from './prompts/create-catalog.md'
import createPagePrompt from './prompts/create-page.md'
import { blobToBase64, extractJsonDataFromMd, template } from 'chat-list/utils'
import api from "@api/index";
import { ImageSearchResult, SearchResult } from 'chat-list/types/search';

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