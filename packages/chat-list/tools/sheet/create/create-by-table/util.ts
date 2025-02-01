import { chatByTemplate } from "chat-list/service/message";
import create_table from '../prompts/create_table.md';
import { extractJsonDataFromMd } from "chat-list/utils";

export interface TableColumnOption {
    name: string;
    options: string[];
}

export interface ITableInfo {
    table_name: string;
    table_headers: string[];
    table_rows: string[][];
    table_column_options: TableColumnOption[];
}

export const generateTable = async (table_requirements: string, refer_table: string): Promise<ITableInfo> => {
    const result = await chatByTemplate(create_table, {
        table_requirements,
        refer_table
    });
    const table = extractJsonDataFromMd(result.content);
    return table;
};