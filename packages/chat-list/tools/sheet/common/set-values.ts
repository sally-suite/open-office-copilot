// import sheetApi from '@api/sheet';
import { ChatState, ITool } from 'chat-list/types/plugin';
import { arrayToMarkdownTable, buildChatMessage } from 'chat-list/utils';

export const main: ITool['func'] = async ({ table_data, sheet_name, context }: { table_data: string[][], sheet_name: string, context: ChatState }) => {
    // await sheetApi.setValues(table_data, sheet_name);
    if (table_data.length === 0) {
        return `Sorry, No data need to update.`
    }
    const { appendMsg } = context;
    appendMsg(buildChatMessage(
        `Here is result data:\n${arrayToMarkdownTable(table_data)}\n,please click on Insert button to update data to sheet.`,
        'text',
        'assistant'
    ))
    return `Ok,I have show data to user,let user check it and update data to sheet.`; // 返回表格数据，以便在聊天窗口中显示
}

export default {
    "type": 'function',
    "name": "set_values",
    "description": `Set the data to sheet,If no sheet is specified, the default is the active sheet.`,
    "parameters": {
        "type": "object",
        "properties": {
            "table_data": {
                "type": "array",
                "description": `Table data,include headers,is a two-dimensional array`,
                "items": {
                    "type": "array",
                    "items": {
                        "type": "string"
                    }
                }
            },
            "sheet_name": {
                "type": "string",
                "description": `Sheet name`
            },
        },
        "required": [
            "table_data",
            "sheet_name"
        ]
    },
    func: main
} as unknown as ITool;