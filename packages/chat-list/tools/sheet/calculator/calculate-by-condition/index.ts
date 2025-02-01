
import {
    arrayToMarkdownTable,
    extractCodeFromMd, getFunc, isTwoDimensionalArray, objectToHorizontalArray, template,
} from 'chat-list/utils';
import { getValues } from 'chat-list/service/sheet'
import { chatByPrompt } from 'chat-list/service/message';
import description from './description.md'
import { ITool } from 'chat-list/types/plugin';
import systemFunction from './system-function.md';

export const func = async ({ condtion, sheet_name }: { condtion: string, sheet_name: string }) => {

    const sampleData = await getValues(2, sheet_name as any);
    if (!sampleData || sampleData.length <= 0) {
        throw new Error('Not find data in current sheet.')
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
                return 'sample'
            } else if (typeof p == 'number') {
                return 1;
            }
            return p;
        })
    })
    const allSampleData = [heads].concat(tableData);
    const prompt = template(systemFunction, {
        tableData: JSON.stringify(allSampleData)
    })
    const res = await chatByPrompt(prompt, condtion)
    const { content } = res;
    const jsCode = extractCodeFromMd(content as string);
    const fun = getFunc(jsCode);
    const data = await getValues(0, sheet_name);
    const copy = JSON.parse(JSON.stringify(data));
    const value = fun(copy);
    let result: any = value;
    if (isTwoDimensionalArray(value)) {
        result = arrayToMarkdownTable(value);
    } if (typeof value === 'object') {
        result = arrayToMarkdownTable(objectToHorizontalArray(value));

    } else if (typeof value === 'number') {
        result = value;
    } else if (typeof value === 'string') {
        result = value;
    }
    return `Result is \n${result}`;
}

export default {
    type: 'function',
    name: 'calculate_by_condtion',
    description,
    parameters: {
        "type": "object",
        "properties": {
            "condtion": {
                "type": "string",
                "description": `Data calculation condition`
            },
            "sheet_name": {
                "type": "string",
                "description": `Sheet name`
            }
        },
        "required": ['condtion']
    },
    func
} as unknown as ITool;

