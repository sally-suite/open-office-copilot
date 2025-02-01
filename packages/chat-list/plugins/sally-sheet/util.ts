import { IChatMessage } from 'types/message';
import taskPlanPrompt from './promps/task-plan.md';
import { extractJsonDataFromMd, template } from 'chat-list/utils';
import { IChatPlugin } from 'chat-list/types/plugin';
import { IMessageBody } from 'chat-list/types/chat';


export const buildPrompt = (user_requirement: string, plugins: IChatPlugin[]) => {
    const agents_list = plugins.filter(p => p.action !== 'main').map((plg, index) => {
        return `${index + 1}.${plg.action}, ${plg.description}`
    }).join('\n');
    return template(taskPlanPrompt, {
        user_requirement,
        agents_list
    })
}

export const buildSystemMessage = (input: string, plugins: IChatPlugin[]): IMessageBody => {
    const context = {
        role: 'system',
        content: buildPrompt(input, plugins)
    } as IMessageBody;
    return context
}

export const buildMainMessages = async (messages: IChatMessage[], input: string, plugins: IChatPlugin[]) => {
    const context = {
        role: 'system',
        content: buildPrompt(input, plugins)
    }

    return [
        context,
        ...messages,
        {
            role: 'user',
            content: input
        }
    ]
}

export const parseNextTask = (content: string) => {
    const result = extractJsonDataFromMd(content)

    if (!result) {
        return [];
    }
    if (result.tasks && result.tasks.length > 0)
        return result.tasks;
    return [];
}