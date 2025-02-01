import { extractCodeFromMd, template } from 'chat-list/utils';
import createPrompt from './prompts/create.md';
import editPrompt from './prompts/update.md';

import { chat } from 'chat-list/service/message';
import { IMessageBody } from 'chat-list/types/chat';

export const editFunction = async (sheetInfo: string, input: string, oldCode: string) => {
    let prompt = 'You are a Python expert.';
    if (sheetInfo) {
        prompt = template(editPrompt, {
            code: oldCode,
            sheetInfo,
        });
    }

    const context: IMessageBody = {
        role: 'system',
        content: prompt
    };
    const result = await chat({
        messages: [
            context,
            {
                role: 'user',
                content: `User requirement:${input}`
            }
        ],
        temperature: 0.5
    });
    return extractCodeFromMd(result.content);
};

export const createFunction = async (sheetInfo: string, input: string) => {
    let prompt = 'You are a Python expert.';
    if (sheetInfo) {
        prompt = template(createPrompt, {
            sheetInfo,
        });
    }
    const context: IMessageBody = {
        role: 'system',
        content: prompt
    };
    const result = await chat({
        messages: [
            context,
            {
                role: 'user',
                content: `User requirement:${input}`
            }
        ],
        temperature: 0.5
    });
    const code = extractCodeFromMd(result.content);
    if (code) {
        return code;
    }
    return result?.content;
};
