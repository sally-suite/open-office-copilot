import { template } from 'chat-list/utils';
import prompt from './prompts/translate-prompt.md';

export const translatePrompt = (content = '', from = '', to = '') => {
    return template(prompt, { targetLanguate: to, content });
};