import { IChatBody, IChatResult, ICompletionsBody } from "chat-list/types/chat";
import { IUserOrderState } from "chat-list/types/license";
export type ColumnType = 'string' | 'number' | 'boolean';

export interface DataValidationColConfig {
    col: number,
    type: ColumnType,
    options: (string | number | boolean)[],
}

export interface ITableOption {
    headerRowColor?: string,
    headerFontColor?: string,
    firstRowColor?: string,
    secondRowColor?: string,
    footerRowColor?: string,
    borderColor?: string,
    rowFontColor?: string,
    theme?: string;
    active?: boolean;
}

export interface IAddChartOption {
    address?: string,
    type: string,
    title: string,
    xAxisTitle: string,
    yAxisTitle: string,
    yAxisTitles: string[],
    isStack: boolean,
    position?: number[]
}


export interface ISheetService {
    initSheet: (name?: string, titles?: string[], options?: ITableOption) => Promise<string>;
    formatTable: (options?: ITableOption, sheetName?: string) => Promise<void>;
    AddChart: (option: IAddChartOption) => Promise<string>;
    setDataValidationAfterRow: (row: number, colConfigs: DataValidationColConfig[], urls: string[]) => Promise<void>
    setFormula: (formula: string) => void;
    transposeTable: () => Promise<void>;
    getValues: (limit?: number, sheetName?: string, options?: { range: 'all' | 'default' }) => Promise<string>;
    setValues: (values: string[][], sheetName?: string) => Promise<void>;
    insertImage: (dataUrl: string, width?: number, height?: number) => Promise<void>;
    getRowColNum: (sheetName?: string, rangeAddress?: string) => Promise<{ row: number; col: number; rowNum: number, colNum: number }>;
    getRangeA1Notation: (sheetName?: string) => Promise<string>;
    showModalDialog: (file: string, title: string, width?: number, height?: number, callback?: (args: any) => void) => Promise<void>;
    insertTable: (value: string[][], options: ITableOption) => Promise<void>;
    appendRows: (value: string[][]) => Promise<void>;
    insertText: (value: string) => Promise<void>;
    highlightRowsWithColor: (rows: number[], color: string) => Promise<void>;
    clearHighlightRows: () => Promise<void>;
    registSelectEvent?: (callback: (args: { address: string, values: string[][] }) => void) => Promise<void>;
    runScript: (code: string) => Promise<any>;
    getSheetInfo: () => Promise<ISheetInfo>;
    getValuesByRange: (rowOrA1Notation: number | string, column?: number, numRows?: number, numColumns?: number, sheetName?: string) => Promise<string>;
    setValuesByRange: (values: string[][], rowOrA1Notation: number | string, column?: number, numRows?: number, numColumns?: number, sheetName?: string) => Promise<void>;
    showSidePanel: (name: string, type: string) => Promise<void>;
    getActiveRange: () => Promise<IRangeValue>;
    createPivotTable: (param: {
        title: string,
        source_range: string,
        rows?: number[],
        columns?: number[],
        values?: { title: string, column: number, summarize_by: string, show_as?: string }[],
        filters?: number[],
        chartConfig: {
            chartType: any;
            chartTitle: string;
        }
    }) => Promise<{ image: string, title: string, values?: string[][] }>;
    copySheet: (sourceSheet: string, targetSheet: string) => string;
    activeSheet: (sheetName: string, dataRange?: string) => void;
}
export interface ISheetHead {
    "name": string,
    "addr": string,
    "row": number,
    "column": number
}
export interface ISheetInfo {
    current: string,
    sheets: string[],
    activeRange?: string,
    sheetInfo?: {
        sheetName: string,
        headers: ISheetHead[],
        dataRangeCells: string
        firstThreeRowData?: string[][],
        dataRowExample?: string[][],
    }[],

}

export interface IRangeValue {
    address: string;
    row: number;
    col: number;
    rowNum: number;
    colNum: number;
    values: (string | number)[][];
}

export interface IRange {
    row: number;
    col: number;
    rowNum: number;
    colNum: number;
}
export interface IExcelService {
    addSheet: (name: string, titles: string[], options?: ITableOption) => Promise<void>;
    formatTable: (options?: ITableOption) => Promise<void>;
    getRange: (range: string) => Promise<IRange>;
    getValues: (limit?: number) => Promise<string>;
    setValues: (values: string[][]) => Promise<void>;
    setFormula: (formula: string) => void;
    AddChart: (option: IAddChartOption) => Promise<string>;

    insertImage: (dataUrl: string, width?: number, height?: number) => Promise<void>;
    setDataValidationAfterRow: (row: number, colConfigs: DataValidationColConfig[], urls: string[]) => Promise<void>
    showModalDialog: (file: string, title: string, width?: number, height?: number, callback?: (args: any) => void) => Promise<void>;

    transposeTable: () => Promise<void>;
    insertTable: (value: string[][], options: ITableOption) => Promise<void>;
    appendRows: (value: string[][]) => Promise<void>;
    insertText: (value: string) => Promise<void>;
    highlightRowsWithColor: (rows: number[], color: string) => Promise<void>;
    clearHighlightRows: () => Promise<void>;
    runScript: (code: string) => void;

}