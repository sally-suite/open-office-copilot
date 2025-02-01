import { template } from 'chat-list/utils';
import prompt from './prompts/trunslate-text-v2.md';
import { IMessageBody, ToolFunction } from 'chat-list/types/chat';
import getFunctions from './prompts/functions';
import { LANGUAGE_MAP } from 'chat-list/data/translate/languages';

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


export const buildTranslateFunctionMessage = (): {
    prompt: string,
    tools: ToolFunction[],
} => {
    const tools: ToolFunction[] = getFunctions();
    // const prompt = template(promptWithFunction, {
    //     input,
    //     target,
    // })
    const lngs = LANGUAGE_MAP.filter(p => p.value != '').map((item) => {
        return `${item.value}:${item.text}`;
    }).join('\n');
    const prompt = `You are a translator and you need to call the function with the following language code and language name as parameters:\n ${lngs}`;

    return {
        prompt,
        tools
    };

};