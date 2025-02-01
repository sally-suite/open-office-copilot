
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
        keyword: keywords
    }) as SearchResult[];
    const targets = results.filter(p => p.content || p.snippet);
    if (targets.length == 0) {
        return 'Search result is empty'
    }
    const msg = buildChatMessage(<CardSearch results={targets} />, 'card', 'assistant');
    appendMsg(msg);
    const reply = targets.map((item) => {
        return `URL:${item.url}\n\nTITLE:${item.title}\n\nCONTENT:\n${item.content || item.snippet}`
    }).join('\n\n');

    return `# SEARCH RESULT:\n\n${reply} \n\nSummarize above pages content, help user add footnotes to the citations.`
}

export default {
    type: 'function',
    name: 'search',
    description: "Search the internet",
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

