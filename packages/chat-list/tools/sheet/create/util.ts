import { FieldConfig } from 'chat-list/types/field';
// import { template } from 'chat-list/utils';
import promptV3 from './prompts/prompt-v3.md';
import promptV5 from './prompts/prompt-v5.md';
interface ITableInfo {
  tableName: string;
  columns: string[];
  options: { [x: string]: string[] };
}

export function extractTableInfo(inputText: string): ITableInfo {
  const tableInfo: ITableInfo = {
    tableName: '',
    columns: [],
    options: {},
  };

  // Extract table name
  const tableNameMatch = inputText.match(/Table Name:\s*(\w+)/);
  if (tableNameMatch) {
    tableInfo.tableName = tableNameMatch[1];
  }

  // Extract columns
  const columnsMatch = inputText.match(/Columns:\s*([\w\s,]+)\n/);
  if (columnsMatch) {
    tableInfo.columns = columnsMatch[1]
      .split(',')
      .map((column) => column.trim());
  }

  // Extract options
  const optionsMatch = inputText.match(/Options:\s*([\s\S]+)\n/);
  if (optionsMatch) {
    const optionsText = optionsMatch[1];
    const optionsLines = optionsText.split('\n').map((line) => line.trim());

    for (const line of optionsLines) {
      const optionMatch = line.match(/(\w+):\s*([\w\s,]+)\s*/);
      if (optionMatch) {
        const optionName = optionMatch[1];
        const optionValues = optionMatch[2]
          .split(',')
          .map((value) => value.trim());
        tableInfo.options[optionName] = optionValues;
      }
    }
  }

  return tableInfo;
}

export function transformToFieldFormat(
  columns: string[],
  options: { [x: string]: string[] }
): FieldConfig[] {
  const fields = [];

  for (const columnName of columns) {
    const field: FieldConfig = {
      name: columnName,
      type: 'string', // Assuming all columns are of string type by default
      options: [],
    };

    if (options[columnName]) {
      field.options = options[columnName];
    }

    fields.push(field);
  }

  return fields;
}
// const extractedInfo = extractTableInfo(text2);
// console.log(JSON.stringify(extractedInfo, null, 2));

export const extractTableInfoFromMd = (inputText: string): (ITableInfo | undefined) => {
  try {
    const result = JSON.parse(inputText);
    return result;
  } catch (err) {
    // Regular expression to extract JSON data
    const regex = /```.*\n([\s\S]+?)```/;
    const match = regex.exec(inputText);

    if (match && match[1]) {
      const jsonData = match[1];
      try {
        const jsonObject = JSON.parse(jsonData);
        return jsonObject;
      } catch (error) {
        console.error('Error parsing JSON:', error);
      }
    }
  }
  return;
};

export const buildSheetCreateMessages = (tableName: string) => {
  const context = {
    role: 'user',
    content: promptV3
  };

  if (!tableName) {
    return [];
  }
  return [
    context,
    { role: 'assistant', content: "Please input the table name you want to create." },
    { role: 'user', content: tableName }
  ];
};

export const buildTableCreateMessages = (input: string) => {
  const context = {
    role: 'system',
    content: promptV5
  };

  if (!input) {
    return [];
  }
  return [
    context,
    { role: 'user', content: input }
  ];
};

