import { ChatState, ITool } from "chat-list/types/plugin";
import instruction from './promps/instruction.excel.md';
import scriptDescription from './promps/script-description.excel.md'

// import { publish } from 'chat-list/msb/public'
import sheetApi from '@api/sheet';
import { buildChatMessage, extractCodeFromMd } from "chat-list/utils";

/**
 * Code generation and run it in Google Apps Script
 */
export const func = async ({ script, explain, context }: { script: string, explain: string, context: ChatState }) => {
    // const code = extractCodeFromMd(script);
    if (script) {
        let mark = script;
        if (!script.startsWith('```javascript')) {
            mark = `\`\`\`javascript\n${script}\n\`\`\``;
        }
        const resMsg = buildChatMessage(`${explain}\n${mark}`, 'text');
        context.appendMsg(resMsg);

        const code = extractCodeFromMd(script)

        const result = await sheetApi.runScript(code);
        if (result) {
            return `Script is\n${mark}\n` + `and the script execution result is ${JSON.stringify(result)}.`
        }
        return `Script is\n${mark}\nRun completed.`;

    } else {
        return `Sorry! I can't generate the script code`;
    }
}

export default {
    type: 'function',
    name: 'edit_data',
    description: instruction,
    tip: "help me update data ",
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
