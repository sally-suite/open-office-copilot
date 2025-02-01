import { ChatState, ITool } from "chat-list/types/plugin";
import description from './description.md';
// import { publish } from 'chat-list/msb/public'
import sheetApi from '@api/sheet';
import { arrayToMarkdownTable, buildChatMessage, extractJsonDataFromMd, template } from "chat-list/utils";
import { chatByPrompt, chatByTemplate } from "chat-list/service/message";
import answerDataTmp from './answer-data.md'
import { Puzzle } from "lucide-react";

const BATCH_SIZE = 5; // 每个批次处理的行数

/**
 * Code generation and run it in Google Apps Script
 */
export const func = async ({ user_requirements, context }: { user_requirements: string, context: ChatState }) => {

    const range = await sheetApi.getActiveRange();
    const { values, row, col, rowNum, colNum } = range;
    if (!values || values.length <= 0 || values.every(v => v.every(v => !v))) {
        return 'No data found, tell user select a range of data, and can not select an entire column or row.'
    }

    let allValues: any[] = [];
    const totalBatches = Math.ceil(values.length / BATCH_SIZE);
    const exampleRow = values[0]; // 获取示例数据行
    for (let batch = 0; batch < totalBatches; batch++) {
        const batchValues = values.slice(batch * BATCH_SIZE, (batch + 1) * BATCH_SIZE);
        // const prompt = template(answerDataTmp, {
        //     exampleRow: JSON.stringify(exampleRow, null, 2),
        //     tableData: JSON.stringify(batchValues, null, 2), // 将示例数据行添加到批次数据中
        //     requirement: user_requirements
        // });
        // const input = `USER REQUIREMENT:\n${user_requirements}`;
        let content = '';
        await chatByTemplate(answerDataTmp, {
            requirements: user_requirements,
            example_row: JSON.stringify(exampleRow, null, 2),
            table_data: JSON.stringify(batchValues, null, 2),

        }, { stream: true, temperature: 0.7 }, (done, result) => {
            if (result.content) {
                content = result.content;
            }
        });
        const data = extractJsonDataFromMd(content as string);
        if (!data) {
            return `Sorry! I can't answer your question.`;
        }
        let value = data;
        if (!Array.isArray(data)) {
            if (data.data && Array.isArray(data.data)) {
                value = data.data;
            }
        }
        if (Array.isArray(value) && value.length > 0 && Array.isArray(value[0])) {
            await sheetApi.setValuesByRange(value, row + batch * BATCH_SIZE, col, value.length, colNum);
            allValues = allValues.concat(value);
        }
    }
    const resMsg = buildChatMessage(arrayToMarkdownTable(allValues), 'text');
    context.appendMsg(resMsg);
    return 'Table completion done in batches.';

}

export default {
    type: 'function',
    name: 'complete_table',
    description,
    tip: '',
    icon: Puzzle,
    parameters: {
        "type": "object",
        "properties": {
            "user_requirements": {
                "type": "string",
                "description": "User requirements, summarize requirements from message context."
            }
        },
        "required": ["user_requirements"]
    },
    func
} as unknown as ITool;
