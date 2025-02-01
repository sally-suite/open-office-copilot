import { template } from 'chat-list/utils';
import prompt from './prompts/trunslate-text-v2.md';
import { IMessageBody } from 'chat-list/types/chat';


const languageReply: IMessageBody = {
    role: 'assistant',
    content: `Of course,Please provide the text you'd like to translate and let me know the target language.`,
};


export const buildTranslateMessages = (to: string, content: string): IMessageBody[] => {
    const context: IMessageBody = {
        role: 'system',
        content: template(prompt, { input: content, targetLanguate: to }),
    };

    if (!to) {
        return [context];
    }
    return [
        context,
        // languageReply,
        // { role: 'user', content: to },
        // { role: 'assistant', content: `Ok,Target language is ${to}.Please provide the text you'd like me to translate.` },
        // { role: 'user', content }
    ];
};
