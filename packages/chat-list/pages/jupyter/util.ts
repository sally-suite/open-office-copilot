import { extractCodeFromMd, template } from 'chat-list/utils'
import createPrompt from './prompts/create.md'
import editPrompt from './prompts/update.md'

import { chat } from 'chat-list/service/message'
import { IChatResult, IMessageBody } from 'chat-list/types/chat'

export const editFunction = async (sheetInfo: string, input: string, oldCode: string, callback: (done: boolean, code: string) => void) => {
    let prompt = 'You are a Python expert.';
    if (sheetInfo) {
        prompt = template(editPrompt, {
            code: oldCode,
            sheetInfo,
        })
    }

    const context: IMessageBody = {
        role: 'system',
        content: prompt
    }
    const result = await chat({
        messages: [
            context,
            {
                role: 'user',
                content: input
            }
        ],
        stream: true,
        temperature: 0.5
    }, (done: boolean, result: IChatResult) => {
        if (callback) {
            callback(done, extractCodeFromMd(result.content))
        }
    })
    const code = extractCodeFromMd(result.content);
    if (code) {
        return code;
    }
    return result?.content
}

export const createFunction = async (sheetInfo: string, input: string, callback: (done: boolean, code: string) => void) => {
    let prompt = 'You are a Python expert.';
    if (sheetInfo) {
        prompt = template(createPrompt, {
            sheetInfo,
        })
    }
    const context: IMessageBody = {
        role: 'system',
        content: prompt
    }
    const result = await chat({
        messages: [
            context,
            {
                role: 'user',
                content: `User requirement:${input}`
            }
        ],
        stream: true,
        temperature: 0.5
    }, (done: boolean, result: IChatResult) => {
        if (callback) {
            callback(done, extractCodeFromMd(result.content))
        }
    })
    const code = extractCodeFromMd(result.content);
    if (code) {
        return code;
    }
    return result?.content
}

