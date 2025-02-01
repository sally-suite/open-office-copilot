



import { ChatState, ITool } from 'chat-list/types/plugin';
import description from './description.md';
import { buildChatMessage } from 'chat-list/utils';


export const main: ITool['func'] = async ({ latex_code, context }: { latex_code: string, context: ChatState }): Promise<any> => {
    // const result = await chatByPrompt(description, requirement)
    // return result.content;
    if (!latex_code) {
        return 'Generate failed.';
    }
    const { appendMsg } = context;
    let result = latex_code;
    if (!latex_code.startsWith('$')) {
        result = `$${latex_code}$`;
    }
    appendMsg(buildChatMessage(result, 'text'));
    return result;
};

export default {
    "name": "write_formula",
    "description": description,
    "parameters": {
        "type": "object",
        "properties": {
            "latex_code": {
                "type": "string",
                "description": `Formulas that the user wants to generate with LaTex format.`
            }
        },
        "required": [
            "latex_code"
        ]
    },
    func: main
} as unknown as ITool;