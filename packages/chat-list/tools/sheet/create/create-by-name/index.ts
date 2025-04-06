
import sheet from '@api/sheet';
// import second from 'tes'
import instruction from './instruction.md';
import { ChatState, ITool } from 'chat-list/types/plugin';
import { arrayToMarkdownTable, buildChatMessage } from 'chat-list/utils';
import { FieldConfig } from 'chat-list/types/field';
import { DataValidationColConfig } from 'chat-list/types/api/sheet';
import { Grid3X3 } from 'lucide-react';


interface ICreateByNameParams {
    table_name: string,
    table_headers: string[],
    table_rows: string[][],
    context: ChatState,
    // from: Sender,
    table_column_options: FieldConfig[]
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
export const func = async ({ table_name, table_headers, table_rows, table_column_options = [], context }: ICreateByNameParams) => {
    // console.log(table_column_options)
    const sheetName = await sheet.initSheet(table_name, [], { active: true });
    const values = [table_headers].concat(table_rows);
    await sheet.setValues(values, sheetName);
    await sheet.formatTable();
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
            await sheet.setDataValidationAfterRow(1, colConfig, []);
        }
    }

    const result = `${sheetName}\n${arrayToMarkdownTable(values)}`;
    context.appendMsg(buildChatMessage(result, 'text', 'assistant'));

    // return `The table ${sheetName} has been created.\n${result}`
    return `The table ${sheetName} has been created.`;

};

export default {
    name: 'generate_table',
    description: instruction,
    tip: 'create a table about ',
    icon: Grid3X3,
    parameters: {
        "type": "object",
        "properties": {
            "table_name": {
                "type": "string",
                "description": `Table name`
            },
            "table_headers": {
                "type": "array",
                "description": `Table headers`,
                "items": {
                    "type": "string"
                },
            },
            "table_rows": {
                "type": "array",
                "description": `Table rows,if no data rows then return at least five rows of sample data`,
                "items": {
                    "type": "array",
                    "items": {
                        "type": "string"
                    }
                }
            },
            "table_column_options": {
                "type": "array",
                "description": `Table column options,if no options then return empty array.`,
                "items": {
                    "type": "object",
                    "properties": {
                        "name": {
                            "type": "string",
                            "description": `Column header name`
                        },
                        "options": {
                            "type": "array",
                            "description": `Column options`,
                            "items": {
                                "type": "string"
                            }
                        }
                    }
                }
            }
        },
        "required": ['table_name', 'table_headers', 'table_rows', 'table_column_options']
    },
    func
} as unknown as ITool;