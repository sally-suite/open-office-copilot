



import { ITool } from 'chat-list/types/plugin';
import { buildChatMessage } from 'chat-list/utils';
import CardTranslate from 'chat-list/components/card-translate';

import React from 'react';
export const main: ITool['func'] = async ({ target_language, batch_size, tone, sheet_name }: { target_language: string, batch_size: number, tone: string, sheet_name: string }): Promise<any> => {

    // const language = LANGUAGE_MAP.find(p => new RegExp(target_language, 'i').test(p.value) || new RegExp(target_language, 'i').test(p.text));
    // await translateSheetByGpt('', target_language, 'new-sheet', tone, sheet_name, sheet_number);
    return buildChatMessage(
        <CardTranslate targetLanguage={target_language} tone={tone} sheetName={sheet_name} batchSize={batch_size} />,
        'card',
        'assistant',
        null,
        [],
        "I've shown some a translation options to user, you can let user check out and click ok,do not return other tools."
    );
};

export default {
    "name": "translate_sheet",
    "description": `Translate sheet data or selection range to target language`,
    "parameters": {
        "type": "object",
        "properties": {
            "target_language": {
                "type": "string",
                "description": `Target language`
            },
            "tone": {
                "type": "string",
                "description": `Tone of translation`
            },
            "batch_size": {
                "type": "number",
                "description": `Translate rows number by batch`
            },
            "sheet_name": {
                "type": "string",
                "description": `Sheet name`
            }
        },
        "required": [
            "target_language"
        ]
    },
    func: main
} as unknown as ITool;