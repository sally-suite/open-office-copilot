import { ChatState, ITool } from "chat-list/types/plugin";
import instruction from './promps/instruction.word.md';
import scriptDescription from './promps/script-description.word.md';

// import { publish } from 'chat-list/msb/public'
import api from '@api/doc';
import { buildChatMessage } from "chat-list/utils";
import { Code } from 'lucide-react';

/**
 * Code generation and run it in Google Apps Script
 */
export const func = async ({ script, explain, context }: { script: string, explain: string, context: ChatState }) => {
    // const code = extractCodeFromMd(script);
    if (script) {
        const resMsg = buildChatMessage(`${explain}\n\`\`\`javascript\n${script}\n\`\`\``, 'text');
        context.appendMsg(resMsg);

        const result = await api.runScript(script);
        if (result) {
            return `Task done, the script execution result is ${JSON.stringify(result)}.`;
        }
        return 'Task done, script run completed.';

    } else {
        return `Sorry! I can't generate the script code`;
    }
};

export default {
    type: 'function',
    name: 'code_interpreter',
    icon: Code,
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
                "description": `Explain the python code using user's language`

            },
        },
        "required": ['script', 'explain']
    },
    func
} as unknown as ITool;
