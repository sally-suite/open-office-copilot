
import sheetApi from '@api/sheet';
// import second from 'tes'
import instruction from './instruction.md';
import { ChatState, ITool } from 'chat-list/types/plugin';
import { arrayToMarkdownTable, buildChatMessage } from 'chat-list/utils';
import { Sender } from 'chat-list/types/message';
import { FieldConfig } from 'chat-list/types/field';
import { DataValidationColConfig } from 'chat-list/types/api/sheet';
import { Grid3X3 } from 'lucide-react';
import { generateTable } from './util';
import { getValues } from 'chat-list/service/sheet';


interface ICreateByNameParams {
    table_creation_requirements: string,
    context: ChatState,
}
export function getColConfig(fields: FieldConfig[]): DataValidationColConfig[] {
    const titles = fields
        // .filter((p) => typeof p !== 'string')
        .map((field: FieldConfig, index) => {
            if (typeof field === 'string') {
                return null;
            }
            return {
                col: index,
                ...field,
            };
        })
        .filter((p) => !!p);
    return titles as unknown as DataValidationColConfig[];
}
export const func = async ({ table_creation_requirements = '', context }: ICreateByNameParams) => {
    // console.log(table_column_options)
    let tableValues = [];
    const range = await sheetApi.getActiveRange();
    if (range.colNum > 1 || range.rowNum > 1) {
        tableValues = range.values;
    } else {
        tableValues = await getValues();
    }

    const tableInfo = await generateTable(table_creation_requirements, arrayToMarkdownTable(tableValues));
    const { table_name, table_rows, table_headers = [], table_column_options } = tableInfo;
    const sheetName = await sheetApi.initSheet(table_name, [], { active: true });
    const values = [table_headers].concat(table_rows);
    await sheetApi.setValues(values, sheetName);
    await sheetApi.formatTable({}, sheetName);
    if (table_column_options.length > 0) {
        const colConfig = table_headers.map((name, index) => {
            const field = table_column_options.find(p => p.name == name);
            if (!field || !field.options || field.options.length <= 0) {
                return null;
            }
            return {
                col: index,
                type: typeof table_rows[0][index],
                options: field.options || []
            };
        }).filter((p) => !!p) as unknown as DataValidationColConfig[];
        if (colConfig.length > 0) {
            await sheetApi.setDataValidationAfterRow(1, colConfig, []);
        }
    }

    const result = `${sheetName}\n${arrayToMarkdownTable(values)}`;
    context.appendMsg(buildChatMessage(result, 'text', 'assistant'));

    // return `The table ${sheetName} has been created.\n${result}`
    return `Task done, The table ${sheetName} has been created.`;

};

export default {
    name: 'generate_table',
    description: instruction,
    tip: 'create a table about ',
    icon: Grid3X3,
    parameters: {
        "type": "object",
        "properties": {
            "sheet_name": {
                "type": "string",
                "description": `Current sheet name`
            },
            "table_creation_requirements": {
                "type": "string",
                "description": `User requirements for table creation, summarize requirements from message context.`
            }
        },
        "required": ['table_creation_requirements']
    },
    func
} as unknown as ITool;