import { chatWithImage } from 'chat-list/service/message'
import analyzeIndicatorPrompt from './prompts/analyze-indicator.md'
import { IChatResult } from 'chat-list/types/chat';
import { template } from 'chat-list/utils';

export const analyzeIndicator = async (file: File, input: string, callback: (done: boolean, result: IChatResult, stop: () => void) => void): Promise<string> => {
    const prompt = template(analyzeIndicatorPrompt, {
        user_input: input
    })
    const result = await chatWithImage(file, prompt, callback)
    return result.content
}