import { IMessageBody, IModelOption, Role } from "types/chat";
import docApi from '@api/doc';
import sheetApi from '@api/sheet';
import { chat } from './message';
import { template } from "../utils";

export const chatWithPrompt = async (messages: IMessageBody[], options: IModelOption): Promise<string> => {
    const { prompt, temperature = 0.7 } = options;
    const text = await docApi.getSelectedText();
    const content = template(prompt, {
        text,
    });
    const msgs: IMessageBody[] = messages.concat([
        {
            role: 'system' as Role,
            content,
        },
    ]);
    const result = await chat({
        messages: msgs,
        temperature,
    });

    return result.content;
};

const transDocPrompt = `
I need you to translate input text to {{targetLanguage}} in a {{style}} style,output new text.

INPUT:

{{text}}

OUTPUT:`;

export function buildTransLateDocMessages(text: string, sourceLanguage: string, targetLanguage: string, style: string): IMessageBody[] {
    const prompt = template(transDocPrompt, {
        sourceLanguage,
        targetLanguage,
        style,
        text,
    });
    const context: IMessageBody = {
        role: 'user',
        content: prompt,
    };

    return [context];
}

export const translateDocByGoogle = async (sourceLanguage: string, targetLanguage: string) => {
    const text = await docApi.getSelectedText();
    const result = sheetApi.translateText(text, sourceLanguage, targetLanguage);
    return result;
};


