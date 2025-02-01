import { IChatMessage } from 'types/message';
import taskPlanPrompt from './promps/task-plan.md';
import { extractJsonDataFromMd, removeMentions, template } from 'chat-list/utils';
import { IChatPlugin } from 'chat-list/types/plugin';
import { IMessageBody } from 'chat-list/types/chat';
import taskCreatePrompt from './promps/task-create.md';
import taskExamples from './examples/1.json';
import { ITask } from 'chat-list/types/task';

const excludes = ['sally', 'function'];

export const buildPrompt = (user_requirement: string, plugins: IChatPlugin[]) => {
    const agents_list = plugins.filter(p => !excludes.includes(p.action)).map((plg, index) => {
        return `## ${index + 1}.${plg.action} ## \n ${plg.instruction} \n`;
    }).join('\n');
    return template(taskPlanPrompt, {
        user_requirement,
        agents_list
    });
};

export const buildSystemMessage = (input: string, plugins: IChatPlugin[]): IMessageBody => {
    const context = {
        role: 'system',
        content: buildPrompt(input, plugins)
    } as IMessageBody;
    return context;
};

export const buildMainMessages = async (messages: IChatMessage[], input: string, plugins: IChatPlugin[]) => {
    const context = {
        role: 'system',
        content: buildPrompt(input, plugins)
    };

    return [
        context,
        ...messages,
        {
            role: 'user',
            content: input
        }
    ];
};

export const parseTaskList = (content: string): ITask[] => {
    const result: ITask[] = extractJsonDataFromMd(content);
    if (!result) {
        return [];
    }
    return result;
};

export const parseNextTask = (tasks: ITask[]): any => {
    if (tasks && tasks.length > 0)
        return tasks.find(p => p.status === 'pending');
    return null;
};

export function extractField(filed: string, text: string) {
    const reasonMatch = text.match(new RegExp(`${filed}: (.*?)$`, 'i'));
    if (reasonMatch && reasonMatch.length > 1) {
        return reasonMatch[1];
    } else {
        return "Reason not found";
    }
}

export const parseTaskResult = (input: string): { status: 'successfully' | 'failed', reason?: string, result?: string } => {
    const content = removeMentions(input);
    // if (content.includes('successfully')) {
    //     const result = extractField('result', content);
    //     return {
    //         status: 'successfully',
    //         result
    //     }
    // }
    if (content.startsWith('Task executed failed')) {
        const reason = extractField('reason', content);
        return {
            status: 'failed',
            reason
        };
    }
    return {
        status: 'successfully',
        result: content
    };
};

export const buildCreateTaskPrompt = (objective: string, plugins: IChatPlugin[]): IMessageBody[] => {
    const skill_descriptions = plugins.filter(p => !excludes.includes(p.action)).map((p, i) => {
        return `## ${i + 1}. ${p.action} ## \n ${p.instruction} \n`;
    }).join('\n');
    const examples = taskExamples.map(({ objective, examples }) => {
        return `
        [EXAMPLE OBJECTIVE]
        ${objective}
        [EXAMPLE TASKLIST]
        ${JSON.stringify(examples, null, 2)}
        `;
    }).join('/n');

    const content = template(taskCreatePrompt, {
        objective,
        skill_descriptions,
        examples,
    });

    const context: IMessageBody = {
        role: 'system',
        content
    };
    return [
        context,
        {
            role: 'user',
            content: `OBJECTIVE:${objective}`
        }
    ];
};