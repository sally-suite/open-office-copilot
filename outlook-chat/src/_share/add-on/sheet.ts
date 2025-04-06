import { DataValidationColConfig, ITableOption } from "chat-list/types/api/sheet";
import { columnNum2letter, letter2columnNum, pixelsToPoints, transposeArray } from './utils'
import jwt_decode from "jwt-decode";
import { DOMAIN_NAME } from './constants'
import { runCode } from './code'
// import { ExcelScript } from '@microsoft/office-scripts-excel';

export const getEmail = async (): Promise<string> => {
    try {
        debugger;
        let userTokenEncoded = await OfficeRuntime.auth.getAccessToken();
        debugger;
        let userToken: any = jwt_decode(userTokenEncoded); // Using the https://www.npmjs.com/package/jwt-decode library.
        alert(userToken.name);
        console.log(userToken.name); // user name
        console.log(userToken.preferred_username); // email
        console.log(userToken.oid); // user id
    } catch (exception) {
        console.error(exception)
        debugger;
        if (exception.code === 13003) {
            // SSO is not supported for domain user accounts, only
            // Microsoft 365 Education or work account, or a Microsoft account.
        } else {
            // Handle error
        }
    }
    return '';
}

export const getRange = (sheet: Excel.Worksheet, row: number, col: number, rowNum: number, colNum: number): Excel.Range => {
    const addr = columnNum2letter(col) + row + ':' + columnNum2letter(col + colNum - 1) + (row + rowNum - 1);
    const range = sheet.getRange(addr);
    return range;
}

export const formatTable = async (options: ITableOption, sheetName?: string) => {
    return await Excel.run(async (context) => {
        let sheets = context.workbook.worksheets;
        let tarSheet;
        if (sheetName) {
            tarSheet = sheets.getItemOrNullObject(sheetName)
        } else {
            tarSheet = sheets.getActiveWorksheet();
        }
        tarSheet.activate();
        // const sheet = context.workbook.worksheets.getActiveWorksheet();
        const addr = await getRangeA1Notation();
        const range = tarSheet.getRange(addr);
        range.load(['rowIndex', 'columnIndex', 'rowCount', 'columnCount'])
        await context.sync();
        const row = range.rowIndex + 1;
        const col = range.columnIndex + 1;
        const rowNum = range.rowCount
        const colNum = range.columnCount;
        await formatTableByRange(row, col, rowNum, colNum, options, sheetName)
    })
}

export const formatTableByRange = async (row: number, col: number, rowNum: number, colNum: number, options?: ITableOption, sheetName?: string) => {
    const {
        headerRowColor = '#80cf9c',
        headerFontColor = '#000000',
        firstRowColor = '#ffffff',
        secondRowColor = '#eaf8f0',
        footerRowColor = '#bbe7cc',
        borderColor = '#EDEDED',
        rowFontColor = '#000000',
        theme = 'LIGHT_GREY',
    } = (options || {});
    await Excel.run(async (context) => {
        let sheets = context.workbook.worksheets;
        let tarSheet;
        if (sheetName) {
            tarSheet = sheets.getItemOrNullObject(sheetName)
        } else {
            tarSheet = sheets.getActiveWorksheet();
        }
        tarSheet.activate();
        // 获取要格式化的数据范围
        var dataRange = getRange(tarSheet, row, col, rowNum, colNum); // 替换为你的数据范围
        tarSheet.tables.add(dataRange, true);

        if (Office.context.requirements.isSetSupported("ExcelApi", "1.2")) {
            tarSheet.getUsedRange().format.autofitColumns();
            tarSheet.getUsedRange().format.autofitRows();
        }

        // var headerRange = table.getHeaderRowRange();
        // headerRange.format.fill.color = headerRowColor;
        // headerRange.format.font.color = headerFontColor;
        // headerRange.format.font.bold = true;
        // headerRange.format.horizontalAlignment = 'Center';
        // var bodyRange = table.getDataBodyRange();
        // bodyRange.format.borders.load(['items'])
        // await context.sync();
        // bodyRange.format.borders.items.forEach((item) => {
        //     item.weight = 'Thin';
        //     item.color = borderColor;
        // })
        // for (let i = 0; i < rowNum; i++) {
        //     if (i % 2 == 0) {
        //         table.rows.getItemAt(i).getRange().format.fill.color = secondRowColor; // 偶数行背景色
        //     } else {
        //         table.rows.getItemAt(i).getRange().format.fill.color = firstRowColor; // 偶数行背景色
        //     }
        // }
    });
}

export const activeSheet = (sheetName: string) => {
    return Excel.run(async (context) => {
        let sheets = context.workbook.worksheets;
        sheets.load("items");
        await context.sync();
        sheets.getItem(sheetName).activate();
    });
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

export async function copySheet(sourceSheet: string, targetSheet: string) {
    try {
        return await Excel.run(async (context) => {
            const tarSheet = context.workbook.worksheets.getItemOrNullObject(targetSheet)
            const sheetToCopy = context.workbook.worksheets.getItem(sourceSheet); // 要复制的工作表
            // let sampleSheet = myWorkbook.worksheets.getActiveWorksheet();
            let copiedSheet = sheetToCopy.copy(Excel.WorksheetPositionType.after, sheetToCopy);
            await context.sync();
            if (!tarSheet || tarSheet.isNullObject) {
                copiedSheet.name = targetSheet;
                await context.sync();
                return targetSheet;
            } else {
                copiedSheet.load(['name'])
                await context.sync();
                return copiedSheet.name;
            }

        });
    } catch (error) {
        console.error(error);
    }
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
    return await Excel.run(async (context) => {
        // 根据sheetName获取sheet
        let sheet = context.workbook.worksheets.getActiveWorksheet();
        if (sheetName) {
            sheet = context.workbook.worksheets.getItem(sheetName);
        }
        let address = '';
        if (options.range === 'default') {
            // 获取sheet中选的区域，如果没有，获取sheet的使用的区域
            let selectedRange = context.workbook.getSelectedRange();
            selectedRange.load(['rowCount', 'columnCount', 'address'])
            await context.sync();
            if (selectedRange.rowCount > 1 || selectedRange.columnCount > 1) {
                const [name, addr] = selectedRange.address.split('!');
                if (!sheetName || name == sheetName) {
                    address = addr;
                }
            }
            if (!address) {
                selectedRange = sheet.getUsedRange();
                selectedRange.load('address')
                await context.sync();
                address = selectedRange.address
            }
        } else if (options.range === 'all') {
            const selectedRange = sheet.getUsedRange();
            selectedRange.load('address')
            await context.sync();
            address = selectedRange.address
        }
        const range = sheet.getRange(address);
        range.load('values');
        await context.sync();
        if (range.values) {
            if (!limit) {
                return JSON.stringify(range.values);
            }
            return JSON.stringify(range.values.slice(0, limit));
        } else {
            return JSON.stringify([]);
        }
    });
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

export const getRangeA1Notation = async () => {
    return await Excel.run(async (context) => {
        const sheet = context.workbook.worksheets.getActiveWorksheet();
        let range = context.workbook.getSelectedRange();

        range.load(['rowCount', 'columnCount', 'address'])
        await context.sync();
        if (range.rowCount > 1 || range.columnCount > 1) {
            return range.address.split('!')[1];
        }
        range = sheet.getUsedRange();
        range.load('address')
        await context.sync();
        return range.address.split('!')[1];
    });
}



export const setFormula = async (formula: string) => {
    return await Excel.run(async function (context) {
        var selectedRange = context.workbook.getSelectedRange();
        selectedRange.formulas = [[`=${formula}`]];
        await context.sync();
    })
}

export const getRowColNum = async (sheetName?: string, rangeAddress?: string): Promise<{ row: number, col: number, rowNum: number; colNum: number; }> => {
    return Excel.run(async function (context) {
        let sheet
        if (sheetName) {
            sheet = context.workbook.worksheets.getItemOrNullObject(sheetName);
            sheet.load(['isNullObject'])
            await context.sync();
        }
        if (!sheet || sheet.isNullObject) {
            sheet = context.workbook.worksheets.getActiveWorksheet();
        }
        let selectedRange;
        if (rangeAddress) {
            selectedRange = sheet.getRange(rangeAddress);
        } else {
            selectedRange = context.workbook.getSelectedRange();
        }
        // let selectedRange = context.workbook.getSelectedRange();
        selectedRange.load(['rowCount', 'columnCount', 'address'])
        await context.sync();
        let address;
        if (selectedRange.rowCount > 1 || selectedRange.columnCount > 1) {
            const [name, addr] = selectedRange.address.split('!');
            if (!sheetName || name == sheetName) {
                address = addr;
            }
        }
        if (!address) {
            selectedRange = sheet.getUsedRange();
            selectedRange.load('address')
            await context.sync();
            address = selectedRange.address
        }

        const range = sheet.getRange(address)
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
    await setValues([[text]])
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
export const getSheetInfo = (): Promise<{ current: string, sheets: string[] }> => {
    return Excel.run(async (context) => {
        const sheet = context.workbook.worksheets.getActiveWorksheet();
        sheet.load('name');
        const sheets = context.workbook.worksheets;
        sheets.load('items/name');
        return context.sync().then(() => {
            const sheetNames = sheets.items.map((item) => item.name);
            return {
                current: sheet.name,
                sheets: sheetNames
            }
        });
    });
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
    return Excel.run(async (context) => {
        let sheet
        if (sheetName) {
            sheet = context.workbook.worksheets.getItemOrNullObject(sheetName);
            sheet.load(['isNullObject'])
            await context.sync();
        }
        if (!sheet || sheet.isNullObject) {
            sheet = context.workbook.worksheets.getActiveWorksheet();
        }
        if (typeof rowOrA1Notation == 'string') {
            const range = sheet.getRange(rowOrA1Notation);
            range.load('values');

            await context.sync();
            const result = range.values;
            return JSON.stringify(result);
        } else if (typeof rowOrA1Notation == 'number') {
            const range = sheet.getRangeByIndexes(rowOrA1Notation - 1, column - 1, numRows, numColumns);
            range.load('values');
            await context.sync();
            const result = range.values;
            return JSON.stringify(result);
        }
        return '';
    });
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
export const setValuesByRange = (values: string[][], rowOrA1Notation: number | string, column?: number, numRows?: number, numColumns?: number, sheetName?: string): Promise<void> => {
    return Excel.run(async (context) => {
        let sheet
        if (sheetName) {
            sheet = context.workbook.worksheets.getItemOrNullObject(sheetName);
            sheet.load(['isNullObject'])
            await context.sync();
        }
        if (!sheet || sheet.isNullObject) {
            sheet = context.workbook.worksheets.getActiveWorksheet();
        }

        if (typeof rowOrA1Notation == 'string') {
            const range = sheet.getRange(rowOrA1Notation);
            range.values = values;
            return context.sync();
        } else if (typeof rowOrA1Notation == 'number') {
            const range = sheet.getRangeByIndexes(rowOrA1Notation - 1, column - 1, numRows, numColumns);
            range.values = values;
            return context.sync();
        }
    });
};

export const getActiveRange = async () => {
    return Excel.run(async (context) => {
        const sheet = context.workbook.worksheets.getActiveWorksheet();
        let range = context.workbook.getSelectedRange();
        range.load(['rowIndex', 'columnIndex', 'rowCount', 'columnCount', 'address', 'values'])
        await context.sync();
        return {
            address: range.address,
            values: range.values,
            row: range.rowIndex + 1,
            col: range.columnIndex + 1,
            rowNum: range.rowCount,
            colNum: range.columnCount,
        }
    });
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

export function createPivotTable({
    title = '',
    source_range = '',
    rows = [],
    columns = [],
    values = [],
    filters = []
}: {
    title?: string,
    source_range?: string,
    rows?: string[],
    columns?: string[],
    values?: IValuesParams[],
    filters?: string[]
}) {
    return Excel.run(async (context) => {
        // Create a PivotTable named "Farm Sales" on a worksheet called "PivotWorksheet" at cell A2
        // the data comes from the worksheet "DataWorksheet" across the range A1:E21.
        const dataSheet = context.workbook.worksheets.getActiveWorksheet();
        let sheets = context.workbook.worksheets;
        // debugger;
        // sheets.load('items');
        // await context.sync();
        console.log(title)
        let pivotSheet = sheets.getItemOrNullObject(title);
        pivotSheet.load(['isNullObject'])
        await context.sync();
        if (pivotSheet.isNullObject) {
            pivotSheet = sheets.add(title);
            // pivotSheet.activate();
        } else {
            pivotSheet = sheets.add();
            // pivotSheet.activate();
        }
        await context.sync();
        let rangeToAnalyze = dataSheet.getRange(source_range);
        let rangeToPlacePivot = pivotSheet.getRange("A1");
        const pivotTable = pivotSheet.pivotTables.add(
            title,
            rangeToAnalyze,
            rangeToPlacePivot
        );

        rows.forEach((row: string) => {
            pivotTable.rowHierarchies.add(pivotTable.hierarchies.getItem(row));
        })
        await context.sync();
        columns.forEach((col: string) => {
            pivotTable.columnHierarchies.add(pivotTable.hierarchies.getItem(col));
        })
        // console.log('+++++')
        for (let i = 0; i < values.length; i++) {
            const value = values[i];
            const item = pivotTable.dataHierarchies.add(pivotTable.hierarchies.getItem(value.title));
            if (value.summarize_by) {
                item.summarizeBy = ((Excel.AggregationFunction as any)[value.summarize_by.toLowerCase()]) || Excel.AggregationFunction.sum;
            } else {
                item.summarizeBy = Excel.AggregationFunction.sum;
            }
            item.load(["showAs"]);
            await context.sync();
            const showAs = item.showAs;
            // console.log(showAs)
            // console.log((ShowAsMap[value.show_as] || Excel.ShowAsCalculation.none))
            showAs.calculation = (ShowAsMap[value.show_as] || Excel.ShowAsCalculation.none) as Excel.ShowAsCalculation;
            // const field = pivotTable.rowHierarchies.getItem(value.title);
            // console.log(field)
            // await field.load(['fields']);
            // const fields = field.fields;
            // fields.load(['items']);
            // const baseField = fields.getItem(value.title);
            // console.log('====')
            // console.log(baseField)
            // showAs.baseField = baseField;// pivotTable.rowHierarchies.getItem(value.title).fields.getItem(value.title);
            // item.name = value.title;
            item.showAs = showAs;
            await context.sync();
        }
        await context.sync();
        pivotSheet.activate();
    });
}
