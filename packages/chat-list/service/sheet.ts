import sheetApi from '@api/sheet';
import userApi from '@api/user';
import { memoize } from 'chat-list/utils';

export const getHeaderList = async (sheetName = '') => {
    const values = await getValues(1, sheetName);
    if (!values || values.length <= 0) {
        return [];
    }
    return values[0];
};

export const getSheetDataInMarkdown = (data: string[][]) => {
    if (data.length == 0) {
        return '';
    }
    let markdown = '|';

    // 获取表头
    const headerRow = data[0];
    for (let i = 0; i < headerRow.length; i++) {
        markdown += ' ' + headerRow[i] + ' |';
    }

    markdown += '\n|';

    // 添加分隔符
    for (let i = 0; i < headerRow.length; i++) {
        markdown += ' --- |';
    }

    markdown += '\n';

    // 添加数据行
    for (let i = 1; i < data.length; i++) {
        const rowData = data[i];
        for (let j = 0; j < rowData.length; j++) {
            markdown += ' ' + rowData[j] + ' |';
        }
        markdown += '\n';
    }

    return markdown;
};

export const getValues = async (limit?: number, sheetName?: string, options: { range: 'all' | 'default' } = { range: 'default' }): Promise<string[][]> => {
    const result = await sheetApi.getValues(limit, sheetName, options || { range: 'default' });
    return JSON.parse(result);
};

export const getValuesByRange = async (rowOrA1Notation: number | string, column?: number, numRows?: number, numColumns?: number, sheetName?: string): Promise<string[][]> => {
    const result = await sheetApi.getValuesByRange(rowOrA1Notation, column, numRows, numColumns, sheetName);
    return JSON.parse(result);
};

export const getEmailWithCache = memoize(async () => {
    return await userApi.getEmail();
});

export const getSheetInfo = async () => {
    try {
        const sheet = await sheetApi.getSheetInfo();
        if (!sheet) {
            return '';
        }
        const sheetData = sheet.sheetInfo;

        const content = `
[ACTIVE SHEET]
${sheet.current}

[SELECTED RANGE]
${sheet.activeRange}

[ALL SHEETS INFO]
\`\`\`json
${JSON.stringify(sheetData, null, 2)}
\`\`\`
`;
        return content;
    } catch (e) {
        return '';
    }
};