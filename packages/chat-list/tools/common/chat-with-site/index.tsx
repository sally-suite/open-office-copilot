



import { ChatState, ITool } from 'chat-list/types/plugin';
import { searchStore } from 'chat-list/utils/vertor';
import { IChatMessage } from 'chat-list/types/message';
import { buildChatMessage } from 'chat-list/utils';
import serApi from "@api/index";
import { SearchResult } from 'chat-list/types/search';
import CardSearch from 'chat-list/components/card-search';
import React from 'react';

// import getSelectTextDesc from './get-selected-text.md'
export const main: ITool['func'] = async ({
    keywords = '',
    site_urls = [],
    message,
    context
}: {
    site_urls: string[],
    keywords: string,
    message: IChatMessage,
    context: ChatState
}): Promise<any> => {
    const { appendMsg } = context;
    const content = message.content;
    let text = '';
    let key = '';

    if (!site_urls || site_urls.length < 0) {
        return "Please provide a web link.";
    }
    try {
        const ps = await Promise.all(site_urls.map(async (url) => {
            const urlObj = new URL(url);
            const domain = urlObj.hostname;
            const results = await serApi.search({
                keyword: `site:${domain} ${keywords}`
            }) as SearchResult[];
            const msg = buildChatMessage(<CardSearch results={results} />, 'card', 'assistant');
            appendMsg(msg);
            key = results.map(p => p.url).join(',');
            return results.map(r => (r.content || r.snippet)).join('\n');
        }));
        text += ps.join('\n');
        console.log(text);

    } catch (e) {
        return "Searching for web content failed, please try another web link.";
    }

    let result = '';
    if (text.length > 1500) {
        const texts = await searchStore(key, text, content, 2);
        result = texts.join('\n');
        // const refer = `#### Reference:\n\n` + result;
        // appendMsg(buildChatMessage(refer, 'text', 'assistant'));
    } else {
        result = text;
    }
    return result;
};

export default {
    "name": "chat_with_site",
    "description": "Chat with the content of site.",
    "parameters": {
        "type": "object",
        "properties": {
            "keywords": {
                "type": "string",
                "description": `Keywords from context,used for search, not include site url.`
            },
            "site_urls": {
                "type": 'array',
                "description": `Site urls from context or reference,can not be empty.`,
                "items": {
                    "type": "string"
                }
            },
        },
        "required": [
            "keywords",
            "site_urls"
        ]
    },
    func: main
} as unknown as ITool;