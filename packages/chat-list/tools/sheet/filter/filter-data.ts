import {
    buildFunctionModeMessages
} from './util';
import sheetApi from '@api/sheet';
import { IMessageBody } from 'chat-list/types/chat';
import {
    arrayToMarkdownTable,
    buildChatMessage,
    extractCodeFromMd,
    getFunc,
} from 'chat-list/utils';
import { colors } from 'chat-list/data/templates/colors';
import { getSheetInfo, getValues } from 'chat-list/service/sheet';
import { chat } from 'chat-list/service/message';
import instruction from './prompts/instruction.md';
import { ITool, IToolFunction } from 'chat-list/types/plugin';

const getSheetDataByFunctionMode = async (input: any, sampleData: string[][]): Promise<string[][]> => {
    const messages = (await buildFunctionModeMessages(input, sampleData)) as IMessageBody[];
    const { content } = await chat({ messages, temperature: 0, stream: false });
    const jsCode = extractCodeFromMd(content as string);
    const data = await getValues();
    const fun = getFunc(jsCode);
    const copy = JSON.parse(JSON.stringify(data));
    const result = fun(copy);
    return result;

};

let colorIndex = 0;

const getColor = () => {
    const color = colors[colorIndex];
    colorIndex = (colorIndex + 1) % colors.length;
    return color;
};

const hightlightRowsByColor = async (rows: { row: number, data: any[] }[], color: string) => {
    const rowNums = rows.map(p => p.row);
    await sheetApi.highlightRowsWithColor(rowNums, color);
};

const buildMarkdownTable = async (rows: { row: number, data: any[] }[], sampleData: string[][]) => {
    const records = rows.map(p => p.data);
    const headers = [sampleData[0]];
    const mark = arrayToMarkdownTable(headers.concat(records));
    return `
  Filter result is
  
  ${mark}
  `;
};

export const main: IToolFunction = async ({ condtion, sheet_name = '', context, from }) => {
    const sampleData = await getValues(2, sheet_name as any);
    if (!sampleData || sampleData.length <= 0) {
        throw new Error('Not find data in current sheet.');
    }
    const heads = sampleData[0];
    if (!heads || heads.length <= 0 || heads.every(p => !p)) {
        throw new Error('Not find header info in current sheet.');
    }
    const bodyData: any[][] = sampleData.slice(1);
    // const tableInfo = await getSheetInfo();
    const tableData = bodyData.map(p => {
        return p.map(p => {
            if (typeof p == 'string') {
                return 'sample';
            } else if (typeof p == 'number') {
                return 1;
            }
            return p;
        });
    });
    const allSampleData = [heads].concat(tableData);
    const data = await getSheetDataByFunctionMode(condtion, allSampleData);
    if (data.length <= 0) {
        return 'Filter result is empty.';
    }
    const name = condtion as string;// (sheet_name || 'filter result') + (Math.random() * 100).toFixed(0)
    const sheetName = await sheetApi.initSheet(name, [], { active: false });
    await sheetApi.setValues(data, sheetName);
    const result = arrayToMarkdownTable(data);
    context.appendMsg(buildChatMessage(`Condition: ${condtion}\n${result}`, 'text', 'assistant', from));
    return `Filtering task have been completed, please check Sheet: ${name}, condition is ${condtion}`;
};


export default {
    "type": 'function',
    name: 'filter_by_condition',
    description: instruction,
    tip: 'filter data by conditions:',
    parameters: {
        "type": "object",
        "properties": {
            "condtion": {
                "type": "string",
                "description": `Filter data condtion`
            },
            "sheet_name": {
                "type": "string",
                "description": `Sheet name`
            }
        },
        "required": ['condtion']
    },
    func: main
} as unknown as ITool;