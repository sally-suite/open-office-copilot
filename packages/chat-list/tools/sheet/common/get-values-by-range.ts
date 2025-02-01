import { getValuesByRange } from 'chat-list/service/sheet';
import { ITool } from 'chat-list/types/plugin';
import { arrayToMarkdownTable } from 'chat-list/utils';

export async function main({ sheet_name, address }: { sheet_name: string, address: string }) {
    const result = await getValuesByRange(address, 0, 0, 0, sheet_name); // 0,0,0,0 means get all rows and columns
    if (result.length > 200) {
        return `Sorry, your table has more than 100 rows, Please select a data range and ensure it does not exceed 200 rows.`
    }
    return JSON.stringify(result);
}

export default {
    "type": 'function',
    "name": "get_values_by_range",
    "description": `Get the user's currently selected table data in sheet,If no sheet is specified, the default is the current sheet.`,
    "parameters": {
        "type": "object",
        "properties": {
            "sheet_name": {
                "type": "string",
                "description": `Sheet name`
            },
            "address": {
                "type": "string",
                "description": `Data range address`
            },
        },
        "required": [
            "sheet_name",
            "address"
        ]
    },
    func: main
} as ITool;