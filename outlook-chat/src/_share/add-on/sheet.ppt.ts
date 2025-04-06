import { DataValidationColConfig, ITableOption } from "chat-list/types/api/sheet";
import { columnNum2letter, letter2columnNum, pixelsToPoints, transposeArray } from './utils'
import jwt_decode from "jwt-decode";
import { DOMAIN_NAME } from './constants'
import { runCode } from './code'

import { IUserOrderState } from 'chat-list/types/license';
import { setLocalStore, getLocalStore } from 'chat-list/local/local'
import XLSX from 'xlsx';
import { blobToArrayBuffer, numberToLetter } from 'chat-list/utils';

// import { ExcelScript } from '@microsoft/office-scripts-excel';

export const getEmail = async (): Promise<string> => {

    return '';
}

export const getRange = (sheet: Excel.Worksheet, row: number, col: number, rowNum: number, colNum: number): Excel.Range => {
    return;
}

export const formatTable = async (options: ITableOption, sheetName?: string) => {
    return;
}

export const formatTableByRange = async (row: number, col: number, rowNum: number, colNum: number, options?: ITableOption, sheetName?: string) => {
    return;
}


export const initSheet = async (name: string, titles?: string[], options: ITableOption = {}): Promise<string> => {
    return await Excel.run(async (context) => {
        let sheets = context.workbook.worksheets;
        const { active } = options;
        if (!name) {
            const sheet = sheets.add();
            if (active) {
                sheet.activate();
            }
            await context.sync();
            return sheet.name;
        }
        // let tarSheet: Excel.Worksheet = worksheet.getActiveWorksheet();//worksheet.getItem(name);
        var tarSheet = sheets.getItemOrNullObject(name);

        // 加载Sheet对象以检查是否存在
        tarSheet.load("name");
        await context.sync();
        if (tarSheet.isNullObject) {
            // Sheet不存在，创建新的Sheet
            tarSheet = sheets.add(name);
            tarSheet.load("name");
            await context.sync();
        } else {
            tarSheet = sheets.add();
            tarSheet.load("name");
            await context.sync();
        }
        if (active) {
            tarSheet.activate();
        }
        if (titles && titles.length > 0) {
            const col = columnNum2letter(titles.length)
            const targetRange = tarSheet.getRange(`A1:${col}1`);
            targetRange.values = [titles]
            await context.sync();
            await formatTableByRange(1, 1, 5, titles.length, options as any, tarSheet.name);
        }
        return tarSheet.name;
    });
}

export const setDataValidationAfterRow = async (row: number, colConfigs: DataValidationColConfig[], urls: string[]) => {
    await Excel.run(async (context) => {
        const sheet = context.workbook.worksheets.getActiveWorksheet();
        const range = sheet.getUsedRange();
        const lastRowRange = range.getLastRow();
        lastRowRange.load("rowIndex");
        await context.sync();

        const lastRow = lastRowRange.rowIndex;
        const rowNum = Math.max(lastRow - row, 5);

        // 创建一个数组来存储需要进行 context.trackedObjects.add() 的范围对象
        const trackedRanges: (Excel.Range | Excel.ConditionalFormat)[] = [];
        const colorMap = [
            '#C6E9FF', // 更浅蓝色
            '#FFE0B2', // 更浅橙色
            '#B3FFB3', // 更浅绿色
            '#FFB2B2', // 更浅红色
            '#D9CCE5', // 更浅紫色
            '#DAD3C3', // 更浅棕色
            '#FFD9EB', // 更浅粉红色
            '#DCDCDC', // 更浅灰色
            '#F5F7B2', // 更浅黄色
            '#B2EFFF', // 更浅青色
        ];
        for (const { col, type, options } of colConfigs) {
            let cellRange = getRange(sheet, row + 1, col + 1, rowNum, 1);
            trackedRanges.push(cellRange);
            cellRange.load('address');

            if (type === 'string') {
                cellRange.numberFormat = [["@"]];
                if (options.length > 0) {
                    cellRange.dataValidation.rule = {
                        list: {
                            inCellDropDown: true,
                            source: options.join(',')
                        }
                    }
                }
            } else if (type === 'boolean') {
                cellRange.dataValidation.rule = {
                    list: {
                        inCellDropDown: true,
                        source: 'Yes,No'
                    }
                }
            }

            for (let i = 0; i < options.length; i++) {
                if (colorMap[i]) {
                    const conditionalFormat = cellRange.conditionalFormats.add(Excel.ConditionalFormatType.cellValue);
                    conditionalFormat.cellValue.format.fill.color = colorMap[i];
                    conditionalFormat.cellValue.rule = {
                        formula1: `="${options[i]}"`,
                        operator: "EqualTo"
                    };
                    // 添加到trackedRanges，以便在所有操作完成后移除
                    trackedRanges.push(conditionalFormat);
                }
            }
        }

        // 确保一次性加载和同步所有已跟踪的对象
        await context.sync();

        // 在所有操作完成之后，从上下文跟踪列表中移除对象
        trackedRanges.forEach(range => context.trackedObjects.remove(range));

        // 最后再次同步以确保所有更改生效
        await context.sync();
    });
}

export const getValues = async (limit?: number, sheetName = '', options = { range: 'default' }): Promise<string> => {
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
}

export const setValues = async (values: string[][], sheetName?: string) => {
    return await Excel.run(async (context) => {
        try {
            const sheets = context.workbook.worksheets
            let tarSheet;
            if (sheetName) {
                tarSheet = sheets.getItemOrNullObject(sheetName);
            } else {
                tarSheet = sheets.getActiveWorksheet();
            }

            tarSheet.load(['name'])
            const range = context.workbook.getSelectedRange();
            range.worksheet.load(['name'])
            range.load(['rowCount', 'rowIndex', 'columnCount', 'columnIndex'])
            await context.sync();
            let startRow = 1, startColumn = 1;
            if (tarSheet.name === range.worksheet.name) {
                if (range.rowCount > 1 || range.columnCount > 1) {
                    startRow = range.rowIndex + 1;
                    startColumn = range.columnIndex + 1;
                } else {
                    startRow = 1;
                    startColumn = 1;
                }
            }

            const numRows = values.length;
            const numColumns = values[0].length;
            const dataRange = getRange(tarSheet,
                startRow,
                startColumn,
                numRows,
                numColumns
            );
            if (numRows > 0 && numColumns > 0) {
                dataRange.values = values;
            }
            await context.sync();
        } catch (err) {
            console.log(err);
        }
    });
}

export const getRangeA1Notation = async (sheetName: string) => {
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
}



export const setFormula = async (formula: string) => {
    return await Excel.run(async function (context) {
        var selectedRange = context.workbook.getSelectedRange();
        selectedRange.formulas = [[`=${formula}`]];
        await context.sync();
    })
}

export const getRowColNum = async (): Promise<{ row: number, col: number, rowNum: number; colNum: number; }> => {
    return Excel.run(async function (context) {
        const sheet = context.workbook.worksheets.getActiveWorksheet();
        const range = sheet.getUsedRange(true);
        range.load(['rowIndex', 'rowCount', 'columnIndex', 'columnCount', 'address'])
        await context.sync();
        if (range.rowCount > 1 || range.columnCount > 1) {
            console.log('range.rowIndex', range.rowIndex)
            console.log('range.columnIndex', range.columnIndex)
            return {
                row: range.rowIndex + 1,
                col: range.columnIndex + 1,
                rowNum: range.rowCount,
                colNum: range.columnCount
            }
        }
        return {
            col: 1,
            row: 1,
            rowNum: 1,
            colNum: 1
        }
    })
}


export const transposeTable = () => {
    return Excel.run(async function (context) {
        const sheet = context.workbook.worksheets.getActiveWorksheet();
        const range = sheet.getUsedRange(true);
        range.load(['values']);
        await context.sync();
        const data = range.values;
        const transposedData = transposeArray(data);
        range.clear();
        const newRange = getRange(sheet, 1, 1, transposedData.length, transposedData[0].length);
        newRange.values = transposedData;
        await context.sync();
    });

}

export const insertImage = (dataUrl: string, width?: number, height?: number) => {
    return Excel.run(async function (context) {
        // const sheet = context.workbook.worksheets.getActiveWorksheet();
        const startIndex = dataUrl.indexOf("base64,");
        const myBase64 = dataUrl.substr(startIndex + 7);
        const range = context.workbook.getSelectedRange();
        range.load(['top', 'left'])
        await context.sync();
        var image = range.worksheet.shapes.addImage(myBase64);
        image.left = range.left;
        image.top = range.top;
        image.width = pixelsToPoints(width || 600);
        image.height = pixelsToPoints(height || 400);
        await context.sync();
    });
}

export const showModalDialog = async (file: string, title: string, width?: number, height?: number, callback?: (arg: any) => void): Promise<void> => {
    let dialog: Office.Dialog = null;
    async function processMessage(arg: any) {
        // console.log(arg.message)
        // console.log(callback);
        // console.log(arg.message)
        const event = JSON.parse(arg.message);
        await callback?.(event);
        if (event.type == 'close') {
            dialog.close();
        }
    }
    Office.context.ui.displayDialogAsync(
        `${DOMAIN_NAME}/${file}.html`,
        { height: 70, width: 80, displayInIframe: true },
        function (result) {
            dialog = result.value;
            dialog.addEventHandler(Office.EventType.DialogMessageReceived, processMessage);
        }
    );
}

interface AddChartOption {
    address: string,
    type: string,
    title: string,
    xAxisTitle: string,
    yAxisTitle: string,
    yAxisTitles: string[],
    isStack: boolean,
    position: number[]
}

export const AddChart = async (option: AddChartOption) => {
    const {
        address = '',
        type = 'Line',
        title = '',
        xAxisTitle = '',
        yAxisTitle = '',
        yAxisTitles = [],
        isStack = false,
        position = []
    } = option;

    const chartMap: { [x: string]: Excel.ChartType } = {
        // Timeline: Excel.ChartType.,
        Area: Excel.ChartType.area,
        Bar: Excel.ChartType.barClustered,
        Bubble: Excel.ChartType.bubble,
        // Candlestick: Excel.ChartType.can,
        Column: Excel.ChartType.columnClustered,
        // Combo: Excel.ChartType.combo,
        // Gauge: Excel.ChartType.gauge,
        Geo: Excel.ChartType.regionMap,
        Histogram: Excel.ChartType.histogram,
        Radar: Excel.ChartType.radar,
        Line: Excel.ChartType.line,
        // Org: Excel.ChartType.org,
        Pie: Excel.ChartType.pie,
        Scatter: Excel.ChartType.xyscatter,
        // Sparkline: Excel.ChartType.sparkline,
        // SteppedArea: Excel.ChartType.st,
        // Table: Excel.ChartType.table,
        Treemap: Excel.ChartType.treemap,
        Waterfall: Excel.ChartType.waterfall,
    };
    return await Excel.run(async (context) => {
        let sheet = context.workbook.worksheets.getActiveWorksheet()
        let activeRange
        if (address) {
            activeRange = sheet.getRange(address);
        } else {
            activeRange = context.workbook.getSelectedRange();
            try {
                activeRange.load(['rowCount', 'columnCount'])
                await context.sync();
                if (activeRange.rowCount <= 1 && activeRange.columnCount <= 1) {
                    activeRange = sheet.getUsedRange();
                }
            } catch (e) {
                activeRange = sheet.getUsedRange();
            }
        }
        activeRange.load(['rowCount', 'rowIndex', 'columnIndex', 'columnCount', 'address', 'values'])
        await context.sync();
        let headers = activeRange.values[0];
        const row = activeRange.rowIndex + 1;
        const col = activeRange.columnIndex + 1;
        const numRows = activeRange.rowCount;
        const numCols = activeRange.columnCount;
        const titles: any = [xAxisTitle];
        const columns: string[] = titles.concat(yAxisTitles);
        const titleCols: { col: number, title: string }[] = columns.map((title: string) => {
            const idx = headers.findIndex((val) => {
                if (!val) {
                    return false;
                }
                return (
                    val.replace(/[\r\n\s]+/g, '').toLowerCase() ==
                    title.replace(/[\r\n\s]+/g, '').toLowerCase()
                );
            });
            if (idx == -1) {
                return null;
            }
            return {
                title: title,
                col: idx + col
            }
        }).filter(p => !!p);
        if (titleCols.length <= 0) {
            throw new Error("No title column,please check the title you input.");
        }
        if (titleCols.length <= 1) {
            throw new Error("Plese input right title.");
        }
        const ranges = titleCols.map(({ col, title }) => {
            return {
                title,
                range: getRange(sheet, row, col, numRows, 1)
            }
        });

        let chart = sheet.charts.add(
            'Line',
            ranges[0].range,
            Excel.ChartSeriesBy.auto);
        chart.series.load(['count', 'items', 'name']);
        await context.sync();
        if (chart.series.count > 0) {
            const first = chart.series.items[0];
            first.delete();
        }

        for (let i = 1; i < ranges.length; i++) {
            let serie = chart.series.add(ranges[i].title);
            serie.setXAxisValues(ranges[0].range);
            serie.chartType = chartMap[type] || 'Line';
            serie.setValues(ranges[i].range)

        }

        chart.title.text = title;
        chart.legend.format.fill.setSolidColor("white");
        chart.left = pixelsToPoints(position?.[0] || 50)
        chart.top = pixelsToPoints(position?.[1] || 50)
        chart.width = pixelsToPoints(360)
        chart.height = pixelsToPoints(240)
        await context.sync();
        const base64 = await chart.getImage(600, 400, 'FitAndCenter')
        await context.sync();
        return `data:image/jpeg;base64,${base64.value}`;
    });
}

export const insertText = async (text: string) => {
    const context = await Excel.run(async (context) => context);
    const range = context.workbook.getSelectedRange();
    range.values = [[text]];
    await context.sync();
}


export const insertTable = async (values: string[][], options: ITableOption) => {
    await setValues(values);
    await formatTable(options)
}


export const insertRows = async (row: number, col: number, dataArray: string[][]) => {
    const newRowNum = dataArray.length;
    if (!newRowNum) {
        return;
    }
    const context = await Excel.run(async (context) => context);
    const sheet = context.workbook.worksheets.getActiveWorksheet();
    // const range = sheet.getUsedRange(true);
    // range.load(['rowIndex', 'rowCount', 'columnIndex', 'columnCount', 'address'])
    // await context.sync();
    const startRow = row;
    const startColumn = col;
    const numRows = dataArray.length;
    const numColumns = dataArray[0].length;
    const dataRange = getRange(sheet,
        startRow,
        startColumn,
        numRows,
        numColumns
    );
    dataRange.values = dataArray;
    await context.sync();
}

/**
 * Append rows to sheet
 * @param {Array} dataArray data[][]
 * @returns
 */
export const appendRows = async (dataArray: string[][] = []) => {
    const newRowNum = dataArray.length;
    if (!newRowNum) {
        return;
    }
    const context = await Excel.run(async (context) => context);
    const sheet = context.workbook.worksheets.getActiveWorksheet();
    const range = sheet.getUsedRange(true);
    range.load(['rowIndex', 'rowCount', 'columnIndex', 'columnCount', 'address'])
    await context.sync();
    const lastRow = range.rowCount + 1;
    const startCol = range.columnIndex + 1;
    await insertRows(lastRow, startCol, dataArray);
}

export async function highlightRowsWithColor(rowsToHighlight: number[] = [], highlightColor = '#f6b26b') {
    try {
        await Excel.run(async (context) => {
            const sheet = context.workbook.worksheets.getActiveWorksheet();

            // 清除之前的高亮
            // sheet.getRange().format.fill.clear();
            const usedRange = sheet.getUsedRange(true);
            // usedRange.format.fill.clear();
            usedRange.load(['columnCount'])
            await context.sync();
            // 遍历每一行，如果行号在 rowsToHighlight 中，则高亮该行
            rowsToHighlight.forEach(async (row) => {
                debugger;
                const range = sheet.getRangeByIndexes(row - 1, 0, 1, usedRange.columnCount);
                range.format.fill.color = highlightColor;
            });
            await context.sync();
        });
    } catch (error) {
        console.error(error);
    }
}

export async function clearHighlightRows() {
    try {
        await Excel.run(async (context) => {
            const sheet = context.workbook.worksheets.getActiveWorksheet();
            // 清除之前的高亮
            sheet.getRange().format.fill.clear();
            await context.sync();
        });
    } catch (error) {
        console.error(error);
    }
}


// 处理选择更改事件
async function handleSelectionChanged(): Promise<{ address: string, values: string[][] }> {
    const context = await Excel.run(async (context) => context);

    // 获取选择范围
    var selectedRange = context.workbook.getSelectedRange();

    // 加载范围中的值
    selectedRange.load(["address", "values"]);

    // 执行操作
    await context.sync();
    // 获取选择的文本
    // var selectedText = selectedRange.values;

    // 处理选择事件，可以输出到控制台或执行其他操作
    // console.log("Selected text: " + selectedText);
    return {
        address: selectedRange.address,
        values: selectedRange.values
    };
}

let registedCallbck: any;
export const registSelectEvent = async (callback: (agrs: { address: string, values: string[][] }) => void): Promise<void> => {
    const context = await Excel.run(async (context) => context);
    if (registedCallbck) {
        context.workbook.onSelectionChanged.remove(registedCallbck);
    }
    registedCallbck = async (args: any) => {

        let currentWorkbook: Excel.Workbook;
        let currentSheet: Excel.Worksheet;

        currentWorkbook = args.workbook;

        currentSheet = currentWorkbook.worksheets.getActiveWorksheet();
        currentSheet.load(['name', 'address'])
        await context.sync();
        const { values, address } = await handleSelectionChanged()
        callback({ address: address, values })
    };
    context.workbook.onSelectionChanged.add(registedCallbck);
    // context.workbook.onActivated.add(async (args) => {
    //     console.log('onActivated')
    //     console.log(args)
    //     if (currentSheet) {
    //         currentSheet.onSelectionChanged.remove(onSelectionRange)
    //     }
    //     currentSheet = context.workbook.worksheets.getActiveWorksheet();
    //     currentSheet.onSelectionChanged.add(onSelectionRange);
    // });
    // 注册选择更改事件
    // currentSheet.onSelectionChanged.add(onSelectionRange);
    // currentSheet.onSelectionChanged.remove(onSelectionRange)
    // 执行操作
    return context.sync();
}


export const runScript = runCode;

/**
 * 获取当前工作表和所有工作表
 * @returns
 *
 */
export const getSheetInfo = async (): Promise<{ current: string, sheets: string[] }> => {
    const file: File = window.INPUT_EXCEL_FILE;
    const buffer = await blobToArrayBuffer(file);
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheetNames = workbook.SheetNames;
    return {
        current: sheetNames[0],
        sheets: sheetNames
    }
};
/**
 *  获取指定范围的值
 * @param rowOrA1Notation 行号或A1表示法
 * @param column        列号
 * @param numRows       行数
 * @param numColumns    列数
 * @returns 
 */
export const getValuesByRange = async (rowOrA1Notation: number | string, column?: number, numRows?: number, numColumns?: number, sheetName?: string): Promise<string> => {
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
}
/**
 *  设置指定范围的值
 * @param values          值
 * @param rowOrA1Notation   行号或A1表示法 
 * @param column            列号   
 * @param numRows           行数  
 * @param numColumns        列数
 * @returns 
 */
export const setValuesByRange = (values: string[][], rowOrA1Notation: number | string, column?: number, numRows?: number, numColumns?: number): Promise<void> => {
    return;
};

export const getActiveRange = async () => {
    return Promise.resolve({
        address: '',
        col: 1,
        row: 1,
        rowNum: 1,
        colNum: 1,
        values: []
    })
}

interface IValuesParams {
    title: string;
    summarize_by: string;
    show_as: string;
}

const ShowAsMap: any = {
    'DEFAULT': 'None',
    'PERCENT_OF_ROW_TOTAL': 'PercentOfRowTotal',
    'PERCENT_OF_COLUMN_TOTAL': 'PercentOfColumnTotal',
    'PERCENT_OF_GRAND_TOTAL': 'PercentOfGrandTotal',
}

export function createPivotTable() {
    return;
}
