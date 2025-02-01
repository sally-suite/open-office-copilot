import { IMessageBody } from 'chat-list/types/chat';
import { ITool, IToolFunction } from 'chat-list/types/plugin';
import explainPrompt from './function-explain.md'
import { template } from 'chat-list/utils';

export const func: IToolFunction = async ({ expression, dataContext, context }) => {
    const promp = template(explainPrompt, {
        sheet_info: dataContext
    })
    const messages: IMessageBody[] = [{
        role: 'system',
        content: promp
    }, {
        role: 'user',
        content: 'Expression: ' + expression
    }]
    const { content } = await context.chat({ messages, temperature: 0 });
    return content;
}

export default {
    type: 'function',
    name: 'explain_function',
    description: "Explain spreadsheet formula",
    parameters: {
        "type": "object",
        "properties": {
            "expression": {
                "type": "string",
                "description": `Expression user input`
            }
        },
        "required": ['expression']
    },
    func
} as unknown as ITool;
