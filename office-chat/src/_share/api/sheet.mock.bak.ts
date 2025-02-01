import { ISheetService, DataValidationColConfig, ITableOption, ISheetHead, ISheetInfo, } from 'chat-list/types/api/sheet';
import XLSX from 'xlsx';
import { blobToArrayBuffer, numberToLetter } from 'chat-list/utils';

class SheetServiceMock implements ISheetService {
  appendRows = async (value: string[][]) => {
    return;
  };
  highlightRowsWithColor = (rows: number[], color: string): Promise<void> => {
    return;
  };
  clearHighlightRows = (): Promise<void> => {
    return;
  };
  showModalDialog: (file: string, title: string, width?: number, height?: number) => Promise<void>;
  insertTable: (value: string[][], options: ITableOption) => Promise<void>;
  sleep() {
    return new Promise((resolve) => {
      setTimeout(resolve, 2000);
    });
  }
  initSheet: (name: string, titles: string[], options?: ITableOption) => Promise<void> = () => void 0;
  formatTable: (options?: ITableOption) => Promise<void> = () => void 0;
  AddChart: (type: string, title: string, xAxisTitle: string, yAxisTitle: string, yAxisTitles: string[]) => Promise<string> = async () => {
    return '';
  };
  setDataValidationAfterRow: (row: number, colConfigs: DataValidationColConfig[], urls: string[]) => Promise<void> = () => void 0;
  translateText: (text: string, sourceLanguage: string, targetLanguage: string) => Promise<string> = () => void 0;
  setFormula: (formula: string) => void = () => void 0;
  transposeTable: () => Promise<void> = () => void 0;
  getValues = async (limit = 0, sheetName = '') => {
    const file: File = window.INPUT_EXCEL_FILE;
    const buffer = await blobToArrayBuffer(file);
    const workbook = XLSX.read(buffer, { type: 'array' });
    const name = workbook.SheetNames.find((n: string) => n === sheetName) || workbook.SheetNames[0];
    const worksheet = workbook.Sheets[name];
    const jsonData: string[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    if (limit > 0) {
      return JSON.stringify(jsonData.slice(0, limit));
    }
    return JSON.stringify(jsonData);
  };
  setValues: (values: string[][]) => Promise<void> = () => void 0;
  insertImage: (dataUrl: string) => Promise<void> = () => void 0;
  getRowColNum: () => Promise<{ col: number; row: number; rowNum: number; colNum: number; }> = () => {
    return Promise.resolve({
      col: 1,
      row: 1,
      rowNum: 12,
      colNum: 4
    })
  };
  getRangeA1Notation = async (sheetName: string) => {
    const file: File = window.INPUT_EXCEL_FILE;
    const buffer = await blobToArrayBuffer(file);
    const workbook = XLSX.read(buffer, { type: 'array' });
    const name = workbook.SheetNames.find((n: string) => n === sheetName) || workbook.SheetNames[0];
    const worksheet = workbook.Sheets[name];

    const range = XLSX.utils.decode_range(worksheet['!ref']);
    const address = {
      start: { row: range.s.r + 1, col: range.s.c + 1 }, // 起始行和列（从1开始）
      end: { row: range.e.r + 1, col: range.e.c + 1 }    // 结束行和列（从1开始）
    };
    const a1notion = `${numberToLetter(address.start.col)}${address.start.row}:${numberToLetter(address.end.col)}${address.end.row}`
    return a1notion;
  };
  insertText = async () => {
    await this.sleep();
  };
  runScript = async (code: string) => {
    console.log(code)
    await this.sleep();
  };
  currentSheet = '';
  activeRange = '';
  activeSheet = (sheetName: string, dataRange?: string) => {
    this.currentSheet = sheetName;
    this.activeRange = dataRange;
  };
  getSheetInfo = async (): Promise<ISheetInfo> => {
    if (!window.INPUT_EXCEL_FILE) {
      return null;
    }
    // 使用 XLSX 读取文件，提取sheet名称，不要调用我的函数
    const file: File = window.INPUT_EXCEL_FILE;
    const buffer = await blobToArrayBuffer(file);
    const workbook = XLSX.read(buffer, { type: 'array' });
    // 获取所有工作表的名称
    const sheetNames = workbook.SheetNames as string[]

    // 当前工作表名称
    const currentSheetName = sheetNames[0];

    // 获取工作簿中所有工作表的信息
    const sheetInfo = sheetNames.map(sheetName => {
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      // 获取表头（假设第一行是表头）
      const headersRow = data[0];
      const headers: ISheetHead[] = headersRow.map((header: string, index: number) => {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: index });
        return {
          name: header,
          addr: cellAddress,
          row: 1,
          column: index + 1
        };
      });

      // 获取数据范围
      const range = XLSX.utils.decode_range(sheet['!ref']);
      const dataRangeCells = `${XLSX.utils.encode_cell(range.s)}:${XLSX.utils.encode_cell(range.e)}`;

      return {
        sheetName: sheetName,
        headers: headers,
        dataRangeCells: dataRangeCells,
        dataRowExample: data.slice(1, 3)
      };
    });

    return {
      current: currentSheetName,
      sheets: sheetNames,
      sheetInfo: sheetInfo,
      activeRange: 'A1'
    };
  };
  getValuesByRange = async (rowOrA1Notation: number | string, column?: number, numRows?: number, numColumns?: number, sheetName?: string): Promise<string> => {
    const file: File = window.INPUT_EXCEL_FILE;
    const buffer = await blobToArrayBuffer(file);
    const workbook = XLSX.read(buffer, { type: 'array' });
    const name = workbook.SheetNames.find((n: string) => n === sheetName) || workbook.SheetNames[0];
    const worksheet = workbook.Sheets[name];
    if (typeof rowOrA1Notation === 'string') {
      // 将地址转换成范围对象
      const range = XLSX.utils.decode_range(rowOrA1Notation);
      // 获取指定范围的数据
      const data = XLSX.utils.sheet_to_json(worksheet, {
        range: range,
        header: 1  // 表示第一行为表头
      });
      return JSON.stringify(data);
    } else {
      const data = XLSX.utils.sheet_to_json(worksheet, {
        range: {
          s: {
            r: rowOrA1Notation - 1,
            c: column - 1
          },
          e: {
            r: rowOrA1Notation + numRows - 2,
            c: column + numColumns - 2
          }
        },
        header: 1  // 表示第一行为表头
      });
      return JSON.stringify(data);
    }
  };
  setValuesByRange = async (values: string[][], row: number, col: number, numRows: number, numCols: number): Promise<void> => {
    console.log(values, row, col, numRows, numCols)
    return Promise.resolve();
  }
  getActiveRange = async () => {
    return Promise.resolve({
      address: '',
      col: 1,
      row: 1,
      rowNum: 1,
      colNum: 1,
      values: []
    })
  }
}

export default new SheetServiceMock();