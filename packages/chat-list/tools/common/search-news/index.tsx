
import description from './description.md'
import { ChatState, ITool } from 'chat-list/types/plugin';
import api from "@api/index";
import { SearchResult } from 'chat-list/types/search';
import { buildChatMessage } from 'chat-list/utils';
import CardSearch from 'chat-list/components/card-search'
import React from 'react';

export const func = async ({ keywords, context }: { keywords: string, context: ChatState }) => {
    const { appendMsg } = context;
    const results = await api.search({
        type: 2,
        keyword: keywords
    }) as SearchResult[];
    const targets = results.filter(p => p.content || p.snippet || p.title);
    if (targets.length == 0) {
        return 'Search result is empty'
    }
    const msg = buildChatMessage(<CardSearch results={targets} />, 'card', 'assistant');
    appendMsg(msg);
    const reply = targets.map((item, i) => {
        return `${i + 1}. LINK: [${item.title}](${item.url})\n\nCONTENT:\n\n${item.content || item.snippet || item.title}`
    }).join('\n\n');

    return `# SEARCH NEWS RESULT:\n\n${reply} \n\nSummarize news content, help user add footnotes to the citations.`
}

export default {
    type: 'function',
    name: 'search_news',
    description: "Search news by Google",
    parameters: {
        "type": "object",
        "properties": {
            "keywords": {
                "type": "string",
                "description": `Keywords separated by commas`
            },
        },
        "required": ['keywords']
    },
    func
} as unknown as ITool;

