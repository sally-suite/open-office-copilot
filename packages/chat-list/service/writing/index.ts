import { chatByPrompt } from '../message';
import { IChatResult } from 'chat-list/types/chat';
import api from "@api/index";
import gpt from '@api/gpt';

import { Heading, ImagePlus, ListEnd, Maximize2, Minimize2, Pen, SmilePlus, SpellCheck2, Wand2, Table, Sparkles, Star } from 'lucide-react';
import { ImageSearchResult } from 'chat-list/types/search';
import { ImageGenerations } from 'chat-list/types/image';

export const tones = [
    {
        name: 'Formal',
        code: 'formal',
    },
    {
        name: 'Humorous',
        code: 'humorous',
    },

    {
        name: 'Warm',
        code: 'warm',
    },
    {
        name: 'Casual',
        code: 'casual',
    },
    {
        name: 'Straightforward',
        code: 'straightforward',
    },

    {
        name: 'Kindly',
        code: 'kindly',
    },

    {
        name: 'Confident',
        code: 'confident',
    },

] as { name: string, code: string }[];


export const tools = [
    {
        code: 'rephrase',
        name: 'Improve writing',
        tip: 'Optimize selected text',
        icon: Wand2
    },
    {
        code: 'contine_write',
        name: 'Contine writing',
        tip: 'Contine write selected text',
        icon: ListEnd
    },
    {
        code: 'make_longer',
        name: 'Expand',
        tip: 'Make selected text longer',
        icon: Maximize2
    },
    {
        code: 'make_shorter',
        name: 'Shorten',
        tip: 'Make selected text shorter',
        icon: Minimize2
    },
    {
        code: 'change_tone',
        name: 'Change tone',
        tip: 'Change tone',
        icon: Star,
        options: tones
    },
    // {
    //     code: 'translate',
    //     name: i18n.t('doc.translate', 'Translate'),
    //     tip: i18n.t('doc.tip.translate', 'Translate selected text'),
    //     icon: Languages
    // },
    {
        code: 'make_titles',
        name: 'Make titles',
        tip: 'Make titles for document',
        icon: Heading
    },
    {
        code: 'summarize',
        name: 'Summarize',
        tip: 'Summarize selected text',
        icon: Pen
    },
    {
        code: 'spell_grammar',
        name: 'Fix spelling and grammar',
        tip: 'Fix spelling and grammar',
        icon: SpellCheck2
    },
    {
        code: 'visualize_as_table',
        name: 'Visualize as Table',
        tip: 'Visualize as Table',
        icon: Table
    },
    {
        code: 'add_emoji',
        name: "Emoji",
        tip: 'Add emoji to selected text',
        icon: SmilePlus
    },
    {
        code: 'search_image',
        name: 'Search images',
        tip: 'Search images for selected text',
        icon: ImagePlus
    },
    {
        code: 'generate_image',
        name: 'Generate images',
        tip: 'Generate images for selected text',
        icon: Sparkles
    }
];



export const options = [
    {
        value: 'optimize',
        text: 'Improve writing',
        tip: 'Optimize selected text',
        icon: Wand2
    },
    {
        value: 'contine_write',
        text: 'Contine writing',
        tip: 'Contine write selected text',
        icon: ListEnd
    },
    {
        value: 'make_longer',
        text: 'Expand',
        tip: 'Make selected text longer',
        icon: Maximize2
    },
    {
        value: 'make_shorter',
        text: 'Shorten',
        tip: 'Make selected text shorter',
        icon: Minimize2
    },
    {
        value: 'change_tone',
        text: 'Change tone',
        tip: 'Change tone',
        icon: Star,
        options: tones
    },
    // {
    //     value: 'translate',
    //     text: i18n.t('doc.translate', 'Translate'),
    //     tip: i18n.t('doc.tip.translate', 'Translate selected text'),
    //     icon: Languages
    // },
    {
        value: 'make_titles',
        text: 'Make titles',
        tip: 'Make titles for document',
        icon: Heading
    },
    {
        value: 'summarize',
        text: 'Summarize',
        tip: 'Summarize selected text',
        icon: Pen
    },
    {
        value: 'grammar',
        text: 'Fix spelling and grammar',
        tip: 'Fix spelling and grammar',
        icon: SpellCheck2
    },
    {
        value: 'visualize_as_table',
        text: 'Visualize as Table',
        tip: 'Visualize as Table',
        icon: Table
    },
    {
        value: 'emoji',
        text: "Emoji",
        tip: 'Add emoji to selected text',
        icon: SmilePlus
    },
    {
        value: 'search_image',
        text: 'Search images',
        tip: 'Search images for selected text',
        icon: ImagePlus
    },
    {
        value: 'generate_image',
        text: 'Generate images',
        tip: 'Generate images for selected text',
        icon: Sparkles
    }
];

export const writing = async (text: string, prompt: string, callback?: (done: boolean, result: IChatResult, stop: () => void) => void) => {
    // const prompt = (prompts as any)[code];
    if (!text) {
        return;
    }
    const input = `${prompt}\n\nUSER INPUT:\n${text}\n\nOUTPUT:`;

    const result = await chatByPrompt("", input, {
        temperature: 0.7,
        stream: true
    }, callback);

    return result;
};

export const searchImage = async (text: string): Promise<string> => {
    if (!text) {
        return;
    }
    const input = `Help me generate image search keywords,only output keywords\n\nUSER INPUT:\n${text}\n\nOUTPUT:`;

    const result = await chatByPrompt("", input, {
        temperature: 0.7,
        stream: false
    });
    const keywords = result.content;
    const results = await api.searchImages({
        keyword: keywords,
        num: 10
    }) as ImageSearchResult[];

    const content = results.map(({ title, imageUrl }) => {
        return `![${title}](${imageUrl})`;
    }).join('\n\n');

    return keywords + '\n\n' + content;
};

export const generateImage = async (prompt: string): Promise<string> => {
    if (!prompt) {
        return;
    }
    const result: ImageGenerations = await gpt.generateImages({
        prompt,
        n: 1,
        style: 'vivid',
        model: 'dall-e-3',
        response_format: 'url'
    });
    if (result?.data?.[0].b64_json) {
        const content = `![image](data:image/png;base64,${result.data[0].b64_json})\n\n**Prompt:**\n\n${result?.data?.[0].revised_prompt}`;
        return content;
    } if (result?.data?.[0].url) {
        const content = `![image](${result.data[0].url})\n\n**Prompt:**\n\n${result?.data?.[0].revised_prompt}`;
        return content;
    } else {
        return 'Task failed';
    }
};

export default writing;