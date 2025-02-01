import { chat } from 'chat-list/service/message';
import promptSetting from './prompt'
import docApi from '@api/doc'
import { IChatBody, IChatResult } from 'chat-list/types/chat';

export type PromptType = keyof typeof promptSetting;

export const callPrompt = async (code: PromptType, options: Partial<IChatBody> = { temperature: 0.8, stream: true }, callback?: (done: boolean, result: IChatResult, stop: () => void) => void): Promise<string> => {
    const prompt = promptSetting[code];
    const text = await docApi.getSelectedText();
    if (!text) {
        throw new Error('Please select text')
    }
    const result = await chat({
        temperature: 0.8,
        messages: [
            {
                role: 'system',
                content: `${prompt}\n Returns the language type entered by the user if the user did not specify one.`
            },
            {
                role: 'user',
                content: text,
            }],
        ...options
    }, callback);
    return result?.content;
}