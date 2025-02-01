import instruction from './instruction.md';
import { ChatState, ITool, IToolFunction } from 'chat-list/types/plugin';
import { buildChatMessage } from 'chat-list/utils';
import { Sigma } from 'lucide-react';
export const func: IToolFunction = async ({ function_code, explain, dataContext, context }: { function_code: string, explain: string, dataContext: string, context: ChatState }) => {
    // const promp = template(genExp, {
    //     sheet_info: dataContext
    // })
    // const messages: IMessageBody[] = [{
    //     role: 'system',
    //     content: promp
    // }, {
    //     role: 'user',
    //     content: 'User requirements: ' + requirements
    // }]
    // const { content } = await context.chat({ messages, temperature: 0 });
    // console.log(function_code, explain)
    const { appendMsg } = context;
    const msg = "`" + function_code + "`\n" + explain;
    appendMsg(buildChatMessage(msg));
    return msg;
};

export default {
    type: 'function',
    name: 'generate_function',
    description: instruction,
    tip: 'help me write a function:',
    icon: Sigma,
    parameters: {
        "type": "object",
        "properties": {
            "function_code": {
                "type": "string",
                "description": `Google sheets function or formula expression code,think about the exact cell address`
            },
            "explain": {
                "type": "string",
                "description": `Google sheets function or formula expression explain.`
            }
        },
        "required": ['function_code', 'explain']
    },
    func
} as unknown as ITool;
