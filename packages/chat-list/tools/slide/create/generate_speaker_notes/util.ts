import { chatByTemplate } from 'chat-list/service/message';
import createPagePrompt from './prompts/create-notes.md';


export const generateNotes = async (texts: string[], tone: string): Promise<string> => {
    const result = await chatByTemplate(createPagePrompt, {
        content: texts.join('\n'),
        tone: tone
    }, {
        temperature: 0.8,
        max_tokens: 3000
    });
    return result?.content;
};

