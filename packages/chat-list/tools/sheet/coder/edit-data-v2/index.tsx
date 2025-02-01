import { ChatState, ITool } from "chat-list/types/plugin";
import instruction from './promps/instruction.md';
import scriptDescription from './promps/script-description.md'
// import { publish } from 'chat-list/msb/public'
import sheetApi from '@api/sheet';
import { buildChatMessage } from "chat-list/utils";

/**
 * Code generation and run it in Google Apps Script
 */
export const func = async ({ script, explain, context }: { script: string, explain: string, context: ChatState }) => {
    // const code = extractCodeFromMd(script);
    if (script) {
        const resMsg = buildChatMessage(`${explain}\n\`\`\`javascript\n${script}\n\`\`\``, 'text');
        context.appendMsg(resMsg);
        const result = await sheetApi.runScript(script);
        if (result) {
            return `The script execution result is ${JSON.stringify(result)}.`
        }
        return 'Script run completed.';

    } else {
        return `Sorry! I can't generate the script code`;
    }
}

export default {
    type: 'function',
    name: 'edit_data',
    description: instruction,
    parameters: {
        "type": "object",
        "properties": {
            "script": {
                "type": "string",
                "description": scriptDescription
            },
            'explain': {
                "type": "string",
                "description": `Explain the script`
            },
        },
        "required": ['script', 'explain']
    },
    func
} as unknown as ITool;
