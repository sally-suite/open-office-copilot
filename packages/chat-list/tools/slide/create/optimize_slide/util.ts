import { chatByTemplate } from 'chat-list/service/message';
import createPagePrompt from './prompts/create-page.md';
import { extractJsonDataFromMd } from 'chat-list/utils';

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
    description: string;
    list?: ContentItem[];
}

interface ContentItem {
    title: string;
    description: string;
}


export interface ISlidePage {
    title: string;
    content: string;
    list: {
        title: string;
        description: string;
    }[];
    speaker_notes: string;
    image_search_keywords: string;
}


export const generatePage = async (description: string, language: string): Promise<ISlidePage> => {
    const result = await chatByTemplate(createPagePrompt, {
        description,
        language
    }, {
        temperature: 0.8,
        max_tokens: 3000,
        // response_format: { "type": "json_object" },
    });
    return extractJsonDataFromMd(result?.content);
};
