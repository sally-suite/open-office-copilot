
import { ChatState, ITool } from 'chat-list/types/plugin';
import api from "@api/index";
import { ImageSearchResult, SearchResult } from 'chat-list/types/search';
import { buildChatMessage } from 'chat-list/utils';
import CardSearch from 'chat-list/components/card-search';
import React from 'react';

type SearchType = 'web_page' | 'image' | 'news';

export const func = async ({ type, keywords, context }: { type: SearchType, keywords: string, context: ChatState }) => {
    const { appendMsg } = context;
    if (type == 'web_page') {
        const results = await api.search({
            keyword: keywords
        }) as SearchResult[];
        const targets = results.filter(p => p.content || p.snippet);
        if (targets.length == 0) {
            return 'Search result is empty';
        }
        const msg = buildChatMessage(<CardSearch results={targets} />, 'card', 'assistant');
        appendMsg(msg);
        const reply = targets.map((item) => {
            return `URL:${item.url}\n\nTITLE:${item.title}\n\nCONTENT:\n${item.content || item.snippet}`;
        }).join('\n\n');

        return `# SEARCH RESULT:\n\n${reply} \n\nSummarize above pages content, help user add footnotes to the citations.`;
    } else if (type == 'news') {
        const results = await api.search({
            type: 2,
            keyword: keywords
        }) as SearchResult[];
        const targets = results.filter(p => p.content || p.snippet || p.title);
        if (targets.length == 0) {
            return 'Search result is empty';
        }
        const msg = buildChatMessage(<CardSearch results={targets} />, 'card', 'assistant');
        appendMsg(msg);
        const reply = targets.map((item, i) => {
            return `${i + 1}. LINK: [${item.title}](${item.url})\n\nCONTENT:\n\n${item.content || item.snippet || item.title}`;
        }).join('\n\n');

        return `# SEARCH NEWS RESULT:\n\n${reply} \n\nSummarize news content, help user add footnotes to the citations.`;
    } else if (type == 'image') {
        const results = await api.searchImages({
            keyword: keywords,
            num: 10
        }) as ImageSearchResult[];

        const targets = results.filter(p => p.imageUrl);
        if (targets.length == 0) {
            return 'Search result is empty';
        }
        const content = results.map(({ title, imageUrl }) => {
            return `![${title}](${imageUrl})`;
        }).join('\n\n');

        const msg = buildChatMessage(content, 'text', 'assistant');
        appendMsg(msg);

        return `The pictures has been shown to the user. You don't have to return it, Tell the user to select the picture aboved to insert into the document.`;
    }

};

export default {
    type: 'function',
    name: 'search',
    description: "Search web page, image, news from search engine",
    parameters: {
        "type": "object",
        "properties": {
            "type": {
                "type": "string",
                "description": `Keywords separated by commas`,
                "enum": ["web_page", "image", "news"]
            },
            "keywords": {
                "type": "string",
                "description": `Keywords separated by commas`
            },
        },
        "required": ['type', 'keywords']
    },
    func
} as unknown as ITool;

