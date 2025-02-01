
import { ChatState, ITool } from 'chat-list/types/plugin';
import api from "@api/index";
import { SearchPaperResult } from 'chat-list/types/search';
import CardPapers from 'chat-list/components/card-papers';
import { buildChatMessage } from 'chat-list/utils';
import React from 'react';
import { filterPapers } from './util';
import { Loader2, ScanSearch, Search, Sparkles } from 'lucide-react';
import i18n from 'chat-list/locales/i18n';
import CardPaperInfo from 'chat-list/components/card-paper-info';

export const func = async ({ paper_context, keywords, context }: { paper_context: string, keywords: string, context: ChatState }) => {
    const { appendMsg, showMessage } = context;

    console.log(paper_context, keywords);

    const results = await api.searchPapers({
        keyword: keywords
    }) as SearchPaperResult[];
    // const targets = results.filter(p => p.snippet);
    // if (targets.length == 0) {
    //     return 'Search result is empty'

    // }
    const list = results.map((item) => {
        return `POSITION:${item.position}\n\nTITLE:${item.title}\n\nCONTENT:\n${item.snippet}`;
    }).join('\n\n');

    showMessage((
        <CardPaperInfo papers={results} icon={Search} content={i18n.t('paper:search_some_papers', "10", { num: results.length })} />
    ), 'assistant', 'card');

    const msg = showMessage((
        <CardPaperInfo icon={ScanSearch} content={i18n.t('paper:filtering_papers')} />
    ), 'assistant', 'card');

    const result: number[] = await filterPapers(list, paper_context);

    console.log('filter', result);

    const top3 = results.filter(p => result.includes(p.position));
    msg.update(
        <CardPaperInfo papers={top3} icon={Sparkles} content={i18n.t('paper:search_top_num', "3", { num: top3.length })} />
    );

    // const msg = buildChatMessage(<CardPapers papers={results} />, 'card', 'assistant');
    // appendMsg(msg);

    const reply = top3.map((item) => {
        return `URL:${item.link}\n\nTITLE:${item.title}\n\nCONTENT:\n${item.snippet}`;
    }).join('\n\n');

    return `I've sifted through the three most relevant papers for you:\n\n${reply}`;
};

export default {
    type: 'function',
    name: 'search_papers',
    description: "Search scholar papers from google scholar",
    parameters: {
        "type": "object",
        "properties": {
            "paper_context": {
                "type": "string",
                "description": `Paper context information, from user input or context.`
            },
            "keywords": {
                "type": "string",
                "description": `Keywords separated by commas,from user input or context.`
            },
        },
        "required": ['keywords', 'paper_context']
    },
    func
} as unknown as ITool;

