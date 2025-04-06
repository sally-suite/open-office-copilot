import { chat } from 'chat-list/service/message';
import promptSetting from 'chat-list/service/writing/prompt'
import { IChatBody, IChatResult } from 'chat-list/types/chat';
import { template } from 'chat-list/utils';

export type PromptType = keyof typeof promptSetting;

export const callPrompt = async (code: PromptType, text: string, options: Partial<IChatBody> = { temperature: 0.8, stream: true }, callback?: (done: boolean, result: IChatResult, stop: () => void) => void): Promise<string> => {
    const promptTpl = promptSetting[code];

    const prompt = template(promptTpl, {
        input: text
    })

    if (!text) {
        throw new Error('Please select text')
    }
    const result = await chat({
        temperature: 0.8,
        messages: [
            {
                role: 'user',
                content: prompt
            }],
        ...options
    }, callback);
    return result?.content;
}