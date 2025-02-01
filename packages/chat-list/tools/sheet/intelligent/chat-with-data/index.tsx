import { ChatState, ITool } from "chat-list/types/plugin";
import description from './description.md';
// import { publish } from 'chat-list/msb/public'
import sheetApi from '@api/sheet';
import { arrayToMarkdownTable, buildChatMessage, extractJsonDataFromMd, template } from "chat-list/utils";
import { chatByPrompt } from "chat-list/service/message";
import answerDataTmp from './answer-data.md';
import { IChatMessage } from "chat-list/types/message";
import { getValues } from "chat-list/service/sheet";

/**
 * Code generation and run it in Google Apps Script
 */
export const func = async ({ message, context }: { message: IChatMessage, context: ChatState }) => {
    // const code = extractCodeFromMd(script);
    const { platform, model } = context;
    if (message.content) {
        let values;
        const range = await sheetApi.getActiveRange();
        if (range.colNum > 1 || range.rowNum > 1) {
            values = range.values;
        } else {
            values = await getValues();

        }
        if (!values || values.length <= 0 || values.every(v => v.every(v => !v))) {
            return 'No data found, tell user select a range of data, and can not select an entire column or row.';
        }
        if (values.length > 100) {
            const address = await sheetApi.getRangeA1Notation();
            const lt = address.split(':')[0];
            let formula;
            if (platform === 'google') {
                formula = model.startsWith('gpt') ? "SALLY_GPT3" : "SALLY_GEMINI";
            } else if (platform === 'office') {
                if (model.startsWith('gpt')) {
                    formula = "SL.GPT3";
                } else if (model.startsWith('glm')) {
                    formula = "SL.GLM4";
                } else {
                    formula = "SL.GPT3";
                }
            }
            return `There are too many rows of data, so we recommend using the function mode, you can input function like this \`=${formula}("${message.content}",${lt})\``;
        }
        const prompt = template(answerDataTmp, {
            tableData: JSON.stringify(values),
            requirement: message.content
        });
        const input = `USER REQUIREMENT:\n${message.content}`;
        let content = '';
        await chatByPrompt(prompt, input, { stream: true, temperature: 0.7 }, (done, result) => {
            if (result.content) {
                content = result.content;
            }
        });
        const data = extractJsonDataFromMd(content as string);
        if (!data) {
            return `Sorry! I can't answer your qeustion.`;
        }
        let value = data;
        if (!Array.isArray(data)) {
            if (data.data && Array.isArray(data.data)) {
                value = data.data;
            }
        }
        if (Array.isArray(value) && value.length > 0 && Array.isArray(value[0])) {
            await sheetApi.setValues(value);
            const resMsg = buildChatMessage(`${arrayToMarkdownTable(value)}`, 'text');
            context.appendMsg(resMsg);
            return resMsg;
        } else {
            return JSON.stringify(value);
        }
    } else {
        return `Sorry! I can't answer your qeustion.`;
    }
};

export default {
    type: 'function',
    name: 'chat_with_selected_data',
    description,
    parameters: {
        "type": "object",
        "properties": {
            "empty": {
                "type": "string",
                "description": "no paramter"
            }
        },
        "required": []
    },
    func
} as unknown as ITool;
