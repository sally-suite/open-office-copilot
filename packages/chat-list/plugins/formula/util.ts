import { arrayToMarkdownTable, template } from 'chat-list/utils';
import genExp from './prompts/gen-formula.md'
import sheetApi from '@api/sheet'
import { getHeaderList } from 'chat-list/service/sheet'

function convertToSpreadsheetCode(headers: string[]) {
  const spreadsheetCodes = [];

  // 将数字转换为对应的字母组合
  function getColumnCode(index: number) {
    let columnCode = "";

    while (index > 0) {
      const remainder = (index - 1) % 26;
      columnCode = String.fromCharCode(65 + remainder) + columnCode;
      index = Math.floor((index - 1) / 26);
    }

    return columnCode;
  }

  // 添加第一行，即列字母代码
  const columnCodes = headers.map((header, index) => getColumnCode(index + 1));
  spreadsheetCodes.push(columnCodes);

  // 添加第二行，即原始表头
  spreadsheetCodes.push(headers);

  return spreadsheetCodes;
}

function buildColunsWithCode(headers: string[]) {

  // 将数字转换为对应的字母组合
  function getColumnCode(index: number) {
    let columnCode = "";

    while (index > 0) {
      const remainder = (index - 1) % 26;
      columnCode = String.fromCharCode(65 + remainder) + columnCode;
      index = Math.floor((index - 1) / 26);
    }

    return columnCode;
  }

  // 添加第一行，即列字母代码
  const columnCodes = headers.map((header, index) => {
    const code = getColumnCode(index + 1);
    return `${header}[${code}]`;
  });
  return columnCodes.join(',')
}

export const buildFunctionCreateMessages = async (input: string) => {
  const columns = await getHeaderList();
  const sheetHeads = buildColunsWithCode(columns);
  const rowColNum = await sheetApi.getRowColNum();
  const prompt = template(genExp, {
    input,
    rowNum: rowColNum.rowNum,
    colNum: rowColNum.colNum,
    columns: sheetHeads
  })
  const context = {
    role: 'user',
    content: prompt
  }

  return [
    context
  ]
}
