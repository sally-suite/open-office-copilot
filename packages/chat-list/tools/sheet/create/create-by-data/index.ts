
import sheet from '@api/sheet';
// import second from 'tes'
import instruction from './instruction.md'
import { ITool } from 'chat-list/types/plugin';
import { arrayToMarkdownTable } from 'chat-list/utils';

export const func = async ({ table_data }: { table_data: string[][] }) => {
    await sheet.initSheet('sheet', table_data[0]);
    await sheet.setValues(table_data);
    return `Table data:\n${arrayToMarkdownTable(table_data)}`
}

export default {
    name: 'create_by_data',
    description: instruction,
    parameters: {
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
            }
        },
        "required": ['table_data']
    },
    func
} as unknown as ITool;