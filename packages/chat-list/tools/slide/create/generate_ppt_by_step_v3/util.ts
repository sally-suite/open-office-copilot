import { chatByPrompt, chatByTemplate } from 'chat-list/service/message';
import cataLogPrompt from './prompts/create-catalog.md';
import outlinePrompt from './prompts/create-outline.md';
import createTablePrompt from './prompts/create-table.md';
import createListPrompt from './prompts/create-list.md';
import createChartPrompt from './prompts/create-chart.md';

import { blobToBase64, extractJsonDataFromMd, template } from 'chat-list/utils';
import api from "@api/index";
import { ImageSearchResult, SearchResult } from 'chat-list/types/search';
import themeList from 'chat-list/data/slides/theme.json';

export const SlidePrompts = {
    list: createListPrompt,
    table: createTablePrompt,
    chart: createChartPrompt,
};

export interface Presentation {
    title: string;
    subtitle: string;
    overview: string;
    table_of_contents: string[];
    slides: Slide[];
    theme: string;
}

export interface Slide {
    title: string;
    type: 'list' | 'table';
    description: string;
    list?: ContentItem[];
}

interface ContentItem {
    title: string;
    description: string;
}


export const generateCatalog = async (outline: string, reference: string, pageNum: string, language: string): Promise<Presentation> => {
    const result = await await chatByTemplate(cataLogPrompt, {
        outline,
        reference,
        page_num: pageNum + '',
        language,
        themes: themeList.map(item => item.name).join(','),
    }, {
        temperature: 0.8,
        max_tokens: 3000,
        // response_format: { "type": "json_object" },
    });
    return extractJsonDataFromMd(result.content);
};

export const generateOutline = async (input: string, pageNum: string, language: string, callback?: (done: boolean, result: any, stop: () => void) => void): Promise<string> => {
    const result = await await chatByTemplate(outlinePrompt, {
        user_powerpoint_requirements: input,
        page_num: pageNum + '',
        language,
    }, {
        temperature: 0.8,
        max_tokens: 3000,
    }, callback);
    return result.content;
};

export interface ISlidePage {
    title: string;
    content: string;
    list: {
        title: string;
        description: string;
    }[];
    type: 'list' | 'table' | 'chart';
    table?: string[][];
    speaker_notes: string;
    image_search_keywords: string;
    data?: { chart_type?: string, name: string, labels: string[], values: number[] }[]
}

export const generatePage = async (title: string, description: string, catalog: string[], reference: string, language: string, type: 'list' | 'table' | 'chart'): Promise<ISlidePage> => {
    const prompt = SlidePrompts[type] || createListPrompt;
    const result = await chatByTemplate(prompt, {
        title,
        type,
        description,
        catalog: JSON.stringify(catalog, null, 2),
        reference: reference || 'no reference',
        language
    }, {
        temperature: 0.8,
        max_tokens: 3000,
        response_format: { "type": "json_object" },
    });
    return extractJsonDataFromMd(result?.content);
};


export const searchContent = async (keyword: string) => {
    const results = await api.search({
        keyword
    }) as SearchResult[];
    const targets = results.filter(p => p.content);
    if (targets.length == 0) {
        return '';
    }
    const reply = targets.map((item) => {
        return `## ${item.title}\n\n${item.content}`;
    }).join('\n\n');

    return reply;
};