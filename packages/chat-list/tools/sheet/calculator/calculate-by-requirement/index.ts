import {
    arrayToMarkdownTable,
    getFunc, isTwoDimensionalArray, objectToHorizontalArray,
} from 'chat-list/utils';
import { getValues } from 'chat-list/service/sheet'
import description from './description.md';
import { ITool } from 'chat-list/types/plugin';


export const func = async ({ javascript_code, sheet_name }: { javascript_code: string, sheet_name: string }) => {
    // const value = await getSheetDataByFunctionMode(condtion, sheet_name, sheet_number);
    console.log(javascript_code)
    const fun = getFunc(javascript_code);
    const data = await getValues(0, sheet_name);
    const copy = JSON.parse(JSON.stringify(data));
    const value = fun(copy);
    let result;
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
    description: description,
    parameters: {
        "type": "object",
        "properties": {
            "javascript_code": {
                "type": "string",
                "description": `javascript code for caculate.`
            },
            "sheet_name": {
                "type": "string",
                "description": `Sheet name`
            }
        },
        "required": ['javascript_code']
    },
    func
} as unknown as ITool;

