/* eslint-disable no-inner-declarations */
import { ChatState, ITool } from "chat-list/types/plugin";
import description from './prompts/description.md';
import scriptDescription from './prompts/script-description.openpyxl.md';
import { buildChatMessage, extractCodeFromMd } from "chat-list/utils";
import { createXlsxFile, prepareFolder, writeFile, runFunction, readFilesToData, convertFileToMark, initEnv, updateFileToSheet } from '../util';


/**
 * Code generation and run it in Python
 */
export const func = async ({ active_sheet, script, explain, context }: { active_sheet: string, script: string, explain: string, context: ChatState }) => {
    // const code = extractCodeFromMd(script);
    if (!script) {
        return `Sorry! I can't generate the script code`;
    }
    const { appendMsg } = context;

    const code = extractCodeFromMd(script);
    const resMsg = buildChatMessage(`${explain}\n\`\`\`python\n${code}\n\`\`\``, 'text');
    appendMsg(resMsg);

    const wboutArrayBuffer = await createXlsxFile(active_sheet);
    await prepareFolder(['/input'], false);
    await prepareFolder(['/output'], true);
    await writeFile('/input/data.xlsx', wboutArrayBuffer);
    const result = await runFunction(code, 'main');
    const fileData = await readFilesToData('/output');
    await updateFileToSheet(active_sheet, fileData);
    const fileContents = await convertFileToMark(fileData);
    if (!fileContents || fileContents.length <= 0) {
        return `Script run completed, here is execution result:\n\n${result}`;
    }
    for (let i = 0; i < fileContents.length; i++) {
        const { name, content } = fileContents[i];
        const resMsg = buildChatMessage(`**${name}**\n\n${content}`, 'text');
        context?.appendMsg(resMsg);
    }
    return 'Task completed, let user check result and update data to sheet.';
};

export default {
    type: 'function',
    name: 'python_edit_data',
    description,
    parameters: {
        "type": "object",
        "properties": {
            "active_sheet": {
                "type": "string",
                "description": "Active sheet name",
            },
            "script": {
                "type": "string",
                "description": scriptDescription
            },
            'explain': {
                "type": "string",
                "description": `Explain the python code`
            },
        },
        "required": ["active_sheet", 'script', 'explain']
    },
    func
} as unknown as ITool;
