import { getValues } from 'chat-list/service/sheet';
import { ITool } from 'chat-list/types/plugin';
// import { arrayToMarkdownTable } from 'chat-list/utils';

export async function main({ sheet_name }: { sheet_name: string }) {
    const result = await getValues(0, sheet_name);
    // if (result.length > 100) {
    //     return `Sorry, your table has more than 100 rows, Please select a data range and ensure it does not exceed 100 rows.`
    // }
    return JSON.stringify(result);
}

export default {
    "type": 'function',
    "name": "get_values",
    "description": `Get the user's currently selected table data in sheet,If no sheet is specified, the default is the current sheet.`,
    "parameters": {
        "type": "object",
        "properties": {
            "sheet_name": {
                "type": "string",
                "description": `Sheet name`
            },
        },
        "required": [
            "sheet_name"
        ]
    },
    func: main
} as ITool;