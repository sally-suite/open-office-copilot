import { DataValidationColConfig, ITableOption } from "chat-list/types/api/sheet";
import { columnNum2letter, pixelsToPoints, transposeArray } from './utils'
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
        // console.log(userToken.name); // user name
        // console.log(userToken.preferred_username); // email
        // console.log(userToken.oid); // user id
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
    const addr = columnNum2letter(col - 1) + row + ':' + columnNum2letter(col + colNum - 2) + (row + rowNum - 1);
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
        const addr = await getRangeA1Notation(sheetName);
        const range = tarSheet.getRange(addr);
        range.load(['rowIndex', 'columnIndex', 'rowCount', 'columnCount'])
        await context.sync();

        const row = range.rowIndex + 1;
        const col = range.columnIndex + 1;
        const rowNum = range.rowCount
        const colNum = range.columnCount;
        // console.log(row, col, rowNum, colNum)
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

export const activeSheet = (sheetName: string, dataRange?: string) => {
    return Excel.run(async (context) => {
        let sheets = context.workbook.worksheets;
        sheets.load("items");
        await context.sync();
        const sheet = sheets.getItem(sheetName);
        sheet.activate();
        if (dataRange) {
            let addr = dataRange;
            if (dataRange.indexOf('!') > 0) {
                addr = dataRange.split('!')[1]
            }
            console.log('activeSheet', sheetName, addr)
            const range = sheet.getRange(addr);
            range.select();
        }
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
            const col = columnNum2letter(titles.length - 1)
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
            await context.sync();
            const range = context.workbook.getSelectedRange();
            range.worksheet.load(['name'])
            await context.sync();
            range.load(['rowCount', 'rowIndex', 'columnCount', 'columnIndex'])
            await context.sync();
            let startRow = 1, startColumn = 1;
            if (tarSheet.name === range.worksheet.name) {
                if (range.rowCount > 0 || range.columnCount > 0) {
                    startRow = range.rowIndex + 1;
                    startColumn = range.columnIndex + 1;
                    // range.clear('Contents')
                } else {
                    // const usedRange = tarSheet.getUsedRange();
                    // usedRange.clear('Contents')
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
                dataRange.select();
            }
            await context.sync();
        } catch (err) {
            console.log(err);
        }
    });

}

export const getRangeA1Notation = async (sheetName: string) => {
    return await Excel.run(async (context) => {
        // check if sheet Name is current sheet, if it is current sheet, check select range
        // if not current sheet, check used range
        let activeSheet = context.workbook.worksheets.getActiveWorksheet();
        activeSheet.load(['name']);
        await context.sync();
        if (sheetName && activeSheet.name != sheetName) {
            const tarSheet = context.workbook.worksheets.getItemOrNullObject(sheetName);
            tarSheet.load(['isNullObject'])
            await context.sync();
            if (!tarSheet.isNullObject) {
                const usedRange = tarSheet.getUsedRange();
                usedRange.load('address')
                await context.sync();
                return usedRange.address.split('!')[1];
            } else {
                return '';
            }
        }
        const selectedRange = context.workbook.getSelectedRange();
        selectedRange.load(['rowCount', 'columnCount', 'address'])
        await context.sync();
        if (selectedRange.rowCount > 1 || selectedRange.columnCount > 1) {
            return selectedRange.address.split('!')[1];
        } else {
            const usedRange = activeSheet.getUsedRange();
            usedRange.load('address')
            await context.sync();
            return usedRange.address.split('!')[1];
        }


        // let sheet
        // if (sheetName) {
        //     sheet = context.workbook.worksheets.getItemOrNullObject(sheetName);
        //     sheet.load(['isNullObject'])
        //     await context.sync();
        // }

        // if (!sheet || sheet.isNullObject) {
        //     sheet = context.workbook.worksheets.getActiveWorksheet();
        // }
        // sheet.load(['name'])
        // await context.sync();
        // let range
        // if (sheetName) {
        //     if (sheet.name === sheetName) {
        //         range = context.workbook.getSelectedRange();
        //         range.load(['rowCount', 'columnCount', 'address'])
        //         await context.sync();
        //         if (range.rowCount > 1 || range.columnCount > 1) {
        //             return range.address.split('!')[1];
        //         }
        //     }
        //     range = sheet.getUsedRange();
        // } else {
        //     range = context.workbook.getSelectedRange();
        //     range.load(['rowCount', 'columnCount', 'address'])
        //     await context.sync();
        //     if (range.rowCount > 1 || range.columnCount > 1) {
        //         return range.address.split('!')[1];
        //     }
        //     range = sheet.getUsedRange();
        // }

        // range.load('address')
        // await context.sync();
        // return range.address.split('!')[1];
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
            // console.log('range.rowIndex', range.rowIndex)
            // console.log('range.columnIndex', range.columnIndex)
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
    xAxisTitle: number,
    yAxisTitle: string,
    yAxisTitles: number[],
    isStack: boolean,
    position?: number[]
}

export const AddChart = async (option: AddChartOption) => {
    const {
        address = '',
        type = 'Line',
        title = '',
        xAxisTitle = 1,
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
        try {
            let sheet, activeRange;
            // 从address分析出sheet name和address,可能没有sheet name
            if (address.indexOf('!') > -1) {
                const [sheetName, addr] = address.split('!');
                sheet = context.workbook.worksheets.getItem(sheetName);
                activeRange = sheet.getRange(addr);

            } else {
                sheet = context.workbook.worksheets.getActiveWorksheet()
                activeRange = sheet.getRange(address);
            }
            // if (address) {
            //     activeRange = sheet.getRange(address);
            // } else {
            try {
                activeRange.load(['rowCount', 'columnCount'])
                await context.sync();
                if (activeRange.rowCount <= 1 && activeRange.columnCount <= 1) {
                    if (address) {
                        activeRange = sheet.getRange(address);
                    } else {
                        activeRange = sheet.getUsedRange();
                    }

                }
            } catch (e) {
                activeRange = sheet.getUsedRange();
            }
            // }
            activeRange.load(['rowCount', 'rowIndex', 'columnIndex', 'columnCount', 'address', 'values', 'left', 'width'])
            await context.sync();

            let headers = activeRange.values[0];
            const row = activeRange.rowIndex + 1;
            const col = activeRange.columnIndex + 1;
            const numRows = activeRange.rowCount;
            const numCols = activeRange.columnCount;
            const titles: any = [xAxisTitle];
            const columns: number[] = titles.concat(yAxisTitles);
            const titleCols: { col: number, title: string }[] = columns.map((col: number) => {
                const title = headers[col - 1];
                return {
                    title: title,
                    col: col
                }
            }).filter(p => !!p);
            if (titleCols.length <= 0) {
                throw new Error("No title column,please check the title you input.");
            }
            if (titleCols.length <= 1) {
                throw new Error("Plese input right title.");
            }
            const ranges = titleCols.map(({ col, title }) => {
                const addr = columnNum2letter(col - 1) + (row + 1) + ':' + columnNum2letter(col - 1) + ((row + 1) + numRows - 1);
                const range = sheet.getRange(addr);
                return {
                    title,
                    addr,
                    range
                }
            });

            const dataRangeLeft = activeRange.left + activeRange.width;

            let chart;
            if (type == 'Waterfall' || type == 'Waterfall') {
                chart = sheet.charts.add(
                    chartMap[type] || 'Line',
                    activeRange,
                    Excel.ChartSeriesBy.auto);
            } else if (type == 'Bubble') {
                chart = sheet.charts.add(
                    chartMap[type] || 'Line',
                    activeRange,
                    Excel.ChartSeriesBy.auto);
                chart.series.load(['count', 'items', 'name']);
                await context.sync();
                if (chart.series.count > 0) {
                    for (let i = 0; i < chart.series.count; i++) {
                        const serie = chart.series.items[i];
                        serie.setXAxisValues(ranges[0].range);
                        serie.setBubbleSizes(ranges[i + 1].range);
                    }
                }
            } else {
                for (let i = 1; i < ranges.length; i++) {
                    let serie
                    if (i == 1) {
                        chart = sheet.charts.add(
                            chartMap[type] || 'Line',
                            ranges[0].range,
                            Excel.ChartSeriesBy.auto);
                        chart.series.load(['count', 'items', 'name']);
                        await context.sync();
                        serie = chart.series.items[0];
                    } else {
                        serie = chart.series.add(ranges[i].title);
                    }
                    // 修改图例
                    serie.name = ranges[i].title;
                    serie.setXAxisValues(ranges[0].range);
                    serie.chartType = chartMap[type] || 'Line';
                    serie.setValues(ranges[i].range)
                }
            }

            // const addrs = ranges.map(p => p.addr).join(',')
            // console.log(addrs)
            // const allrange = sheet.getRanges(addrs);
            // let chart = sheet.charts.add(
            //     chartMap[type] || 'Line',
            //     allrange,
            //     Excel.ChartSeriesBy.auto);
            // chart.series.load(['count', 'items', 'name']);
            // await context.sync();

            chart.title.text = title;
            chart.legend.format.fill.setSolidColor("white");
            chart.left = dataRangeLeft + pixelsToPoints(position?.[0] || 50)
            chart.top = pixelsToPoints(position?.[1] || 50)
            chart.width = pixelsToPoints(360)
            chart.height = pixelsToPoints(240)

            await context.sync();
            const base64 = await chart.getImage(600, 400, 'FitAndCenter')
            await context.sync();
            activeRange.select();

            return `data:image/jpeg;base64,${base64.value}`;
        } catch (error) {
            console.error(error);
            throw new Error("Error in create chart:" + error.message + '\n\n' + error.stack);
            // console.log(err);
        }
    });
}

export const insertText = async (text: string) => {
    return await Excel.run(async (context) => {
        try {
            const values = [[text]]
            const sheets = context.workbook.worksheets
            const tarSheet = sheets.getActiveWorksheet();

            const range = context.workbook.getSelectedRange();
            range.load(['rowCount', 'rowIndex', 'columnCount', 'columnIndex'])
            await context.sync();
            let startRow = 1, startColumn = 1;
            startRow = range.rowIndex + 1;
            startColumn = range.columnIndex + 1;

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


export const insertTable = async (values: string[][], options: ITableOption) => {
    await setValues(values);
    await formatTable(options);
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

export const registSelectEvent = async (callback: (agrs: { address: string, values: string[][] }) => void): Promise<() => void> => {
    const context = await Excel.run(async (context) => context);

    const registedCallbck = async (args: any) => {

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
    context.sync();
    return () => {
        context.workbook.onSelectionChanged.remove(registedCallbck);
    }
}


export const runScript = runCode;

/**
 * 获取当前工作表和所有工作表
 * @returns
 *
 */
export const getSheetInfo2 = (): Promise<{ current: string, sheets: string[] }> => {
    return Excel.run(async (context) => {
        const sheet = context.workbook.worksheets.getActiveWorksheet();
        sheet.load('name');
        const sheets = context.workbook.worksheets;
        sheets.load('items/name');
        await context.sync();
        const activeRange = sheet.getUsedRange();
        const sheetNames = sheets.items.map((item) => item.name);
        return {
            current: sheet.name,
            sheets: sheetNames
        }
    });
};


export async function getSheetInfo() {
    return await Excel.run(async (context) => {
        var workbook = context.workbook;
        var sheets = workbook.worksheets;
        sheets.load('items/name');
        var activeSheet = sheets.getActiveWorksheet();
        activeSheet.load('name')
        await context.sync();

        var current = activeSheet.name;

        var names = sheets.items.map((sheet) => sheet.name);
        var sheetInfo: any = [];
        let activeRange = workbook.getSelectedRange();
        activeRange.load(["address", "worksheet", 'rowCount', 'columnCount']);
        await context.sync();
        if (activeRange.rowCount <= 1 && activeRange.columnCount <= 1) {
            activeRange = activeSheet.getUsedRange();
        }
        activeRange.load(["address"]);
        await context.sync();
        const addr = activeRange.address.split('!')[1];
        var activeRangeAddress = `${activeSheet.name}!${addr}`;

        for (let i = 0; i < sheets.items.length; i++) {
            var sheet = sheets.items[i];
            var range;
            if (sheet.name == activeSheet.name) {
                // activeRange.load(['rowCount', 'columnCount'])
                // await context.sync();
                // if (activeRange.rowCount <= 1 && activeRange.columnCount <= 1) {
                //     activeRange = sheet.getUsedRange();
                // }
                range = activeRange;
            } else {
                range = sheet.getUsedRange()
            }

            range.load(["values", "address", "rowIndex", "columnIndex"]);
            await context.sync();
            var values = range.values;

            if (values.length == 0)
                continue;

            var headers = values[0];
            var rangeAddr = range.address.split('!')[1];
            var dataRange = `${sheet.name}!${rangeAddr}`;;
            var row = range.rowIndex + 1; // Excel row indexes are 0-based
            var col = range.columnIndex + 1; // Excel column indexes are 0-based

            var headerInfo = headers.map((header, index) => {
                return {
                    name: header,
                    addr: columnNum2letter(col + index - 1) + row,
                    row: row,
                    column: col + index,
                };
            });

            var dataRowExample = values.slice(1, 3);

            sheetInfo.push({
                sheetName: sheet.name,
                headers: headerInfo,
                dataRangeCells: dataRange,
                dataRowExample
            });
        }
        return {
            current,
            sheets: names,
            sheetInfo,
            activeRange: activeRangeAddress,
        };
    });

}

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
            const numRowsToSet = Math.min(numRows, values.length);
            const range = sheet.getRangeByIndexes(rowOrA1Notation - 1, column - 1, numRowsToSet, numColumns);
            range.values = values.slice(0, numRowsToSet);
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
    column: number;
    title: string;
    summarize_by: Excel.AggregationFunction | "Unknown" | "Automatic" | "Sum" | "Count" | "Average" | "Max" | "Min" | "Product" | "CountNumbers" | "StandardDeviation" | "StandardDeviationP" | "Variance" | "VarianceP";
    show_as: string;
    chatType: string;
}

const ShowAsMap: any = {
    'DEFAULT': 'None',
    'PERCENT_OF_ROW_TOTAL': 'PercentOfRowTotal',
    'PERCENT_OF_COLUMN_TOTAL': 'PercentOfColumnTotal',
    'PERCENT_OF_GRAND_TOTAL': 'PercentOfGrandTotal',
}

export function createPivotTable2({
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
        // console.log(title)
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


export async function isSelectedRangePivotTable(context: any, dataRange: any) {
    try {
        const range = dataRange || context.workbook.getSelectedRange();
        range.load("isPartOfPivotTable");
        await context.sync();
        return range.isPartOfPivotTable;
    } catch (error) {
        console.error("Error checking if range is pivot table:", error);
        throw error;
    }
}

// 获取包含选中区域的透视表（如果存在的话）
export async function getPivotTableFromSelection(context: any, dataRange: any) {
    try {
        const sheet = context.workbook.worksheets.getActiveWorksheet();
        const range = dataRange || context.workbook.getSelectedRange();

        // 加载必要的属性
        range.load("isPartOfPivotTable");
        sheet.pivotTables.load("items");
        await context.sync();

        if (!range.isPartOfPivotTable) {
            return null;
        }

        // 遍历工作表中的所有透视表
        const pivotTables = sheet.pivotTables.items;
        for (let pivotTable of pivotTables) {
            // 加载透视表范围
            pivotTable.layout.load("layoutRange");
            await context.sync();

            // 检查选中区域是否在此透视表范围内
            if (this.isRangeOverlapping(range, pivotTable.layout.layoutRange)) {
                // 加载更多透视表属性以供使用
                pivotTable.load([
                    "name",
                    "rowHierarchies",
                    "columnHierarchies",
                    "dataHierarchies",
                    "filterHierarchies"
                ]);
                await context.sync();
                return pivotTable;
            }
        }
        return null;
    } catch (error) {
        console.error("Error getting pivot table from selection:", error);
        throw error;
    }
}

export async function createPivotTable3({
    title = '',
    source_range = '',
    rows = [],
    columns = [],
    values = [],
    filters = [],
    chartConfigs = [] // 每个图表的配置
}: {
    title?: string,
    source_range?: string,
    rows?: number[],
    columns?: number[],
    values?: IValuesParams[],
    filters?: number[],
    chartConfigs: {
        chartType: any;
        chartTitle: string;
        // position: number[];
        // column: number;
    }[]
}) {
    return await Excel.run(async (context) => {

        let sheet = context.workbook.worksheets.getActiveWorksheet();
        if (source_range.indexOf('!') > 0) {
            const sneetName = source_range.split('!')[0];
            sheet = context.workbook.worksheets.getItemOrNullObject(sneetName);
        }
        console.log(sheet)
        let address = source_range;
        if (source_range.indexOf('!') > 0) {
            address = source_range.split('!')[1];
        }

        const dataRange = sheet.getRange(address);
        dataRange.load("values");
        await context.sync();

        let pivotSheet;
        let pivotTable;

        const isPivotTable = await isSelectedRangePivotTable(context, dataRange);
        // console.log('isPivotTable', isPivotTable)
        if (isPivotTable) {
            pivotSheet = sheet;
            pivotTable = await getPivotTableFromSelection(context, dataRange);
        } else {
            // 添加之前判断是否已经存在同名的sheet
            let newTitle = title;
            pivotSheet = context.workbook.worksheets.getItemOrNullObject(newTitle);
            await context.sync();
            let i = 0;
            // 如果存在,修改title,直到title不重复
            while (!pivotSheet.isNullObject) {
                // console.log(pivotSheet.isNullObject)
                newTitle = `${title}_${++i}`;
                pivotSheet = context.workbook.worksheets.getItemOrNullObject(newTitle);
                await context.sync();
            }
            pivotSheet = context.workbook.worksheets.add(newTitle);
            let rangeToPlacePivot = pivotSheet.getRange("A1");
            // 创建透视表
            pivotTable = sheet.pivotTables.add(title, dataRange, rangeToPlacePivot); // 修正参数顺序
        }

        // 添加行
        for (const rowIndex of rows) {
            const hierarchyName = dataRange.values[0][rowIndex - 1];
            const hierarchy = pivotTable.hierarchies.getItem(hierarchyName); // 使用正确的API获取层次结构
            pivotTable.rowHierarchies.add(hierarchy); // 使用正确的添加行层次结构方法
        }

        // 添加列
        for (const colIndex of columns) {
            const hierarchyName = dataRange.values[0][colIndex - 1];
            const hierarchy = pivotTable.hierarchies.getItem(hierarchyName);
            pivotTable.columnHierarchies.add(hierarchy);
        }

        // 添加值
        for (const valueConfig of values) {
            const { column, summarize_by } = valueConfig;
            const hierarchyName = dataRange.values[0][column - 1];
            const hierarchy = pivotTable.hierarchies.getItem(hierarchyName);
            const dataHierarchy = pivotTable.dataHierarchies.add(hierarchy);
            // 默认使用求和汇总
            // dataHierarchy.summarizeBy = summarize_by || Excel.AggregationFunction.sum;
            dataHierarchy.summarizeBy = ((Excel.AggregationFunction as any)[summarize_by.toLowerCase()]) || Excel.AggregationFunction.sum;
        }

        // 添加过滤器
        for (const filterIndex of filters) {
            const hierarchyName = dataRange.values[0][filterIndex - 1];
            const hierarchy = pivotTable.hierarchies.getItem(hierarchyName);
            pivotTable.filterHierarchies.add(hierarchy);
        }

        await context.sync();
        // 实现 sleep(1000);
        await new Promise(resolve => setTimeout(resolve, 1000));

        var pivotTables = pivotSheet.pivotTables;
        pivotTables.load("items");
        await context.sync();

        // 获取透视表
        var pivotTable0 = pivotTables.getItem(title)

        // 获取透视表范围用于创建图表
        const pivotRange = pivotTable0.layout.getRange();
        pivotRange.load(["address", "left", "width"]);
        await context.sync();

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
        let chartLeft = pixelsToPoints(pivotRange.left + pivotRange.width);
        // 创建多个图表
        for (const config of chartConfigs) {
            const { chartType, chartTitle, } = config;
            const chartTypeValue = chartMap[chartType];
            // 创建图表
            const chart = pivotSheet.charts.add(
                chartTypeValue, // 使用正确的图表类型枚举
                pivotRange,
                Excel.ChartSeriesBy.auto
            );

            // 设置图表标题
            chart.title.text = chartTitle

            // 设置图表位置（可选）
            // chart.setPosition("G12", "M30"); // 根据需要调整位置
            const dataRangeLeft = pivotRange.left + pivotRange.width;

            chart.left = chartLeft;
            chart.top = pixelsToPoints(50)
            chart.width = pixelsToPoints(360)
            chart.height = pixelsToPoints(240)

            chartLeft = chartLeft + pixelsToPoints(410)
            // 注意：在新版本的Office JS API中，不需要显式添加系列
            // 图表会自动使用透视表数据


            // const {
            //     chartType,
            //     titleSuffix,
            //     yValues = [] // 要显示的列索引数组
            // } = config;
            // const chartTypeValue = chartMap[chartType];
            // // 创建图表,默认使用row的range
            // // 获取pivotRange的第一列作为range对象
            // const rowIndex = pivotRange.rowIndex
            // const columnIndex = pivotRange.columnIndex
            // const rowCount = pivotRange.rowCount
            // const columnCount = pivotRange.columnCount
            // const range = pivotSheet.getRangeByIndexes(rowIndex, columnIndex, rowCount, 1);

            // const chart = pivotSheet.charts.add(
            //     chartTypeValue,
            //     range,
            //     Excel.ChartSeriesBy.columns
            // )

            // const chart = pivotSheet.charts.add(
            //     chartTypeValue,
            //     pivotRange,
            //     Excel.ChartSeriesBy.auto
            // );

            // // 清除自动创建的系列
            // chart.series.load("count");
            // await context.sync();

            // const seriesCount = chart.series.count;
            // for (let i = seriesCount - 1; i >= 0; i--) {
            //     chart.series.getItemAt(i).delete();
            // }
            // await context.sync();

            // // 根据yValues添加系列
            // for (const columnIndex of yValues) {
            //     // 获取列标题作为系列名称
            //     const columnName = dataRange.values[0][columnIndex];

            //     // 获取对应的数据层次结构
            //     const hierarchy = pivotTable.hierarchies.getItem(columnName);

            //     // 添加数据系列
            //     chart.series.add(columnName);
            // }

            // // 设置图表标题
            // chart.title.text = `${title} - ${titleSuffix}`;
            // await context.sync();
        }
        pivotSheet.activate();
        await context.sync();
    }).catch((error) => {
        console.error("Error:", error);
        throw error; // 向上传递错误以便调用者处理
    });
}

// const chartMap: { [x: string]: Excel.ChartType } = {
//     // Timeline: Excel.ChartType.,
//     Area: Excel.ChartType.area,
//     Bar: Excel.ChartType.barClustered,
//     Bubble: Excel.ChartType.bubble,
//     // Candlestick: Excel.ChartType.can,
//     Column: Excel.ChartType.columnClustered,
//     // Combo: Excel.ChartType.combo,
//     // Gauge: Excel.ChartType.gauge,
//     Geo: Excel.ChartType.regionMap,
//     Histogram: Excel.ChartType.histogram,
//     Radar: Excel.ChartType.radar,
//     Line: Excel.ChartType.line,
//     // Org: Excel.ChartType.org,
//     Pie: Excel.ChartType.pie,
//     Scatter: Excel.ChartType.xyscatter,
//     // Sparkline: Excel.ChartType.sparkline,
//     // SteppedArea: Excel.ChartType.st,
//     // Table: Excel.ChartType.table,
//     Treemap: Excel.ChartType.treemap,
//     Waterfall: Excel.ChartType.waterfall,
// };

const chartMap: { [x: string]: any } = {
    // Timeline: "",
    Area: "Area",
    Bar: "BarClustered",
    Bubble: "Bubble",
    // Candlestick: "",
    Column: "ColumnClustered",
    // Combo: "",
    // Gauge: "",
    Geo: "RegionMap",
    Histogram: "Histogram",
    Radar: "Radar",
    Line: "Line",
    // Org: "",
    Pie: "Pie",
    Scatter: "XYScatter",
    // Sparkline: "",
    // SteppedArea: "",
    // Table: "",
    Treemap: "Treemap",
    Waterfall: "Waterfall",
};


export async function createPivotSheet({
    title = '',
    source_range = '',
    rows = [],
    columns = [],
    values = [],
    filters = [],
}: {
    title?: string,
    source_range?: string,
    rows?: number[],  // 1-based column index
    columns?: number[],  // 1-based column index
    values?: IValuesParams[],  // column property is 1-based index
    filters?: number[]  // 1-based column index

}): Promise<{
    pivotSheetName: string,
    pivotTableName: string
    values: string[][]
} | null> {
    return await Excel.run(async (context) => {
        try {
            if (!source_range) {
                throw new Error("Source range is required");
            }

            // 1. 初始化工作表和数据范围
            let sheet = context.workbook.worksheets.getActiveWorksheet();
            if (source_range.indexOf('!') > 0) {
                const sheetName = source_range.split('!')[0];
                sheet = context.workbook.worksheets.getItemOrNullObject(sheetName);
            }

            let address = source_range.indexOf('!') > 0 ? source_range.split('!')[1] : source_range;
            const dataRange = sheet.getRange(address);
            dataRange.load("values");

            // 第一次同步：获取基础数据
            await context.sync();

            if (sheet.isNullObject) {
                throw new Error(`Sheet ${source_range.split('!')[0]} not found`);
            }

            if (!dataRange || dataRange.values.length === 0) {
                throw new Error("Invalid data range - empty or undefined");
            }

            // 验证列索引
            const columnCount = dataRange.values[0].length;
            const validateColumnIndex = (index: number, name: string) => {
                if (index < 1 || index > columnCount) {
                    throw new Error(`Invalid ${name} index: ${index}. Column index should be between 1 and ${columnCount}`);
                }
            };

            rows.forEach(index => validateColumnIndex(index, 'row'));
            columns.forEach(index => validateColumnIndex(index, 'column'));
            values.forEach(({ column }) => validateColumnIndex(column, 'value'));
            filters.forEach(index => validateColumnIndex(index, 'filter'));

            // 2. 处理透视表创建
            let pivotSheet;
            let pivotTable: Excel.PivotTable;
            const isPivotTable = await isSelectedRangePivotTable(context, dataRange);

            if (isPivotTable) {
                pivotSheet = sheet;
                pivotTable = await getPivotTableFromSelection(context, dataRange);
            } else {
                // 检查工作表名称
                let newTitle = title;
                pivotSheet = context.workbook.worksheets.getItemOrNullObject(newTitle);

                // 第二次同步：检查工作表是否存在
                await context.sync();

                let i = 0;
                while (!pivotSheet.isNullObject) {
                    newTitle = `${title}_${++i}`;
                    pivotSheet = context.workbook.worksheets.getItemOrNullObject(newTitle);
                    await context.sync();
                }

                // 创建新工作表和透视表
                pivotSheet = context.workbook.worksheets.add(newTitle);
                let rangeToPlacePivot = pivotSheet.getRange("A1");

                // 创建透视表
                pivotTable = sheet.pivotTables.add(title, dataRange, rangeToPlacePivot);
            }

            // 3. 批量添加层次结构
            // 首先收集所有要添加的层次结构
            const hierarchies = {
                rows: rows.map(index => ({
                    type: 'row',
                    name: dataRange.values[0][index - 1],
                    hierarchy: pivotTable.hierarchies.getItem(dataRange.values[0][index - 1])
                })),
                columns: columns.map(index => ({
                    type: 'column',
                    name: dataRange.values[0][index - 1],
                    hierarchy: pivotTable.hierarchies.getItem(dataRange.values[0][index - 1])
                })),
                values: values.map(({ column, summarize_by }) => ({
                    type: 'value',
                    name: dataRange.values[0][column - 1],
                    hierarchy: pivotTable.hierarchies.getItem(dataRange.values[0][column - 1]),
                    summarize_by: ((Excel.AggregationFunction as any)[summarize_by.toLowerCase()]) || Excel.AggregationFunction.sum
                })),
                filters: filters.map(index => ({
                    type: 'filter',
                    name: dataRange.values[0][index - 1],
                    hierarchy: pivotTable.hierarchies.getItem(dataRange.values[0][index - 1])
                }))
            };

            // 批量添加行
            for (const item of hierarchies.rows) {
                pivotTable.rowHierarchies.add(item.hierarchy);
            }

            // 批量添加列
            for (const item of hierarchies.columns) {
                pivotTable.columnHierarchies.add(item.hierarchy);
            }

            // 批量添加值
            for (const item of hierarchies.values) {
                const dataHierarchy = pivotTable.dataHierarchies.add(item.hierarchy);
                dataHierarchy.summarizeBy = item.summarize_by;
            }

            // 批量添加过滤器
            for (const item of hierarchies.filters) {
                pivotTable.filterHierarchies.add(item.hierarchy);
            }

            // 加载透视表数据区域和数据层次结构
            // pivotTable.dataBodyRange.load("address");
            pivotTable.dataHierarchies.load("items");

            // 第五次同步：确保所有层次结构都添加完成
            await context.sync();
            await new Promise(resolve => setTimeout(resolve, 1000));

            // 获取值列的索引
            // const valueColumns = pivotTable.dataHierarchies.items.map((hierarchy, index) => {
            //     return {
            //         name: hierarchy.name,
            //         columnIndex: index + 1  // 1-based index
            //     };
            // });

            // 最后激活工作表
            pivotSheet.activate();

            pivotSheet.load("name");
            await context.sync();

            const rang = await pivotSheet.getUsedRange(true);
            rang.load('values');
            await context.sync();
            return {
                pivotSheetName: pivotSheet.name,
                pivotTableName: title,
                values: rang.values
                // valueColumns: valueColumns  // 返回值列的索引信息
            };

        } catch (error) {
            console.error("Error in createPivotSheet:", error);
            console.log(error.stack)
            throw new Error("Error in create pivot table:" + error.message + '\n\n' + error.stack);
        }
    });
}

export async function createPivotChart({
    pivotSheetName = '',
    pivotTableName = '',
    chartType,
    chartTitle,
}: {
    pivotSheetName?: string,
    pivotTableName?: string,
    chartType: any;
    chartTitle: string;
}) {
    return await Excel.run(async (context) => {
        try {
            const pivotSheet = context.workbook.worksheets.getItem(pivotSheetName);

            // 等待透视表数据完全加载
            await new Promise(resolve => setTimeout(resolve, 1000));

            const pivotTables = pivotSheet.pivotTables;
            pivotTables.load("items");

            // 第六次同步：加载透视表数据
            await context.sync();

            const pivotTable0 = pivotTables.getItem(pivotTableName);
            const pivotRange = pivotTable0.layout.getRange();
            pivotRange.load(["address", "left", "width", "values"]);

            // 第七次同步：加载透视表范围
            await context.sync();

            let chartLeft = pixelsToPoints(pivotRange.left + pivotRange.width);

            const chartTypeValue = chartMap[chartType];
            if (!chartTypeValue) {
                console.warn(`Unsupported chart type: ${chartType}`);
                return null;
            }

            const chart = pivotSheet.charts.add(
                chartTypeValue,
                pivotRange,
                Excel.ChartSeriesBy.auto
            );

            chart.title.text = chartTitle;
            chart.left = chartLeft;
            chart.top = pixelsToPoints(50);
            chart.width = pixelsToPoints(360);
            chart.height = pixelsToPoints(240);

            // 第八次同步：确保所有图表创建完成
            await context.sync();

            const base64 = await chart.getImage(600, 400, 'FitAndCenter')
            await context.sync();

            let chartImage = ({
                image: `data:image/jpeg;base64,${base64.value}`,
                title: chart.title.text,
            });


            // 最后激活工作表
            pivotSheet.activate();
            await context.sync();

            return chartImage;

        } catch (error) {
            // console.error("Error in createPivotTable:", error);
            throw new Error("Error in create chart:" + error.message + '\n\n' + error.stack);
        }
    });
}

export async function createPivotTable({
    title = '',
    source_range = '',
    rows = [],
    columns = [],
    values = [],
    filters = [],
    chartConfig = {
        chartType: '',
        chartTitle: ''
    }
}: {
    title?: string,
    source_range?: string,
    rows?: number[],  // 1-based column index
    columns?: number[],  // 1-based column index
    values?: IValuesParams[],  // column property is 1-based index
    filters?: number[],  // 1-based column index
    chartConfig: {
        chartType: any;
        chartTitle: string;
    }
}): Promise<{
    image?: string;
    title?: string;
    values?: string[][];
} | null> {

    if (chartConfig.chartType == 'Scatter'
        || chartConfig.chartType == 'Histogram'
        || chartConfig.chartType == 'Bubble'
        || chartConfig.chartType == 'Waterfall'
        || chartConfig.chartType == 'Treemap'
    ) {
        const chartImage = await AddChart({
            address: source_range,
            type: chartConfig.chartType,
            title: chartConfig.chartTitle,
            xAxisTitle: rows[0],
            yAxisTitle: title,
            yAxisTitles: values.map((v) => v.column),
            isStack: true
        });
        return {
            title: chartConfig.chartTitle,
            image: chartImage
        }
    } else {
        const result = await createPivotSheet({
            title,
            source_range,
            rows,
            columns,
            values,
            filters
        });

        if (!result)
            return null;

        if (chartConfig && chartConfig.chartType) {
            const chartImage = await createPivotChart({
                pivotSheetName: result.pivotSheetName,
                pivotTableName: result.pivotTableName,
                chartType: chartConfig.chartType,
                chartTitle: chartConfig.chartTitle,
            })

            return {
                image: chartImage.image,
                title: chartImage.title,
                values: result.values
            };
        } else {
            return {
                values: result.values
            };
        }
    }
}
export async function createPivotTable4({
    title = '',
    source_range = '',
    rows = [],
    columns = [],
    values = [],
    filters = [],
    chartConfigs = []
}: {
    title?: string,
    source_range?: string,
    rows?: number[],  // 1-based column index
    columns?: number[],  // 1-based column index
    values?: IValuesParams[],  // column property is 1-based index
    filters?: number[],  // 1-based column index
    chartConfigs: {
        chartType: any;
        chartTitle: string;
    }[]
}) {
    return await Excel.run(async (context) => {
        try {
            if (!source_range) {
                throw new Error("Source range is required");
            }

            // 1. 初始化工作表和数据范围
            let sheet = context.workbook.worksheets.getActiveWorksheet();
            if (source_range.indexOf('!') > 0) {
                const sheetName = source_range.split('!')[0];
                sheet = context.workbook.worksheets.getItemOrNullObject(sheetName);
            }

            let address = source_range.indexOf('!') > 0 ? source_range.split('!')[1] : source_range;
            const dataRange = sheet.getRange(address);
            dataRange.load("values");

            // 第一次同步：获取基础数据
            await context.sync();

            if (sheet.isNullObject) {
                throw new Error(`Sheet ${source_range.split('!')[0]} not found`);
            }

            if (!dataRange || dataRange.values.length === 0) {
                throw new Error("Invalid data range - empty or undefined");
            }

            // 验证列索引
            const columnCount = dataRange.values[0].length;
            const validateColumnIndex = (index: number, name: string) => {
                if (index < 1 || index > columnCount) {
                    throw new Error(`Invalid ${name} index: ${index}. Column index should be between 1 and ${columnCount}`);
                }
            };

            rows.forEach(index => validateColumnIndex(index, 'row'));
            columns.forEach(index => validateColumnIndex(index, 'column'));
            values.forEach(({ column }) => validateColumnIndex(column, 'value'));
            filters.forEach(index => validateColumnIndex(index, 'filter'));

            // 2. 处理透视表创建
            let pivotSheet;
            let pivotTable;
            const isPivotTable = await isSelectedRangePivotTable(context, dataRange);

            if (isPivotTable) {
                pivotSheet = sheet;
                pivotTable = await getPivotTableFromSelection(context, dataRange);
            } else {
                // 检查工作表名称
                let newTitle = title;
                pivotSheet = context.workbook.worksheets.getItemOrNullObject(newTitle);

                // 第二次同步：检查工作表是否存在
                await context.sync();

                let i = 0;
                while (!pivotSheet.isNullObject) {
                    newTitle = `${title}_${++i}`;
                    pivotSheet = context.workbook.worksheets.getItemOrNullObject(newTitle);
                    await context.sync();
                }

                // 创建新工作表和透视表
                pivotSheet = context.workbook.worksheets.add(newTitle);
                let rangeToPlacePivot = pivotSheet.getRange("A1");

                // const existingPivotTables = sheet.pivotTables;
                // existingPivotTables.load("items");

                // // 第三次同步：加载现有透视表
                // await context.sync();

                // // 检查透视表名称冲突
                // let pivotTableName = title;
                // i = 0;
                // while (existingPivotTables.items.some(pt => pt.name === pivotTableName)) {
                //     pivotTableName = `${title}_${++i}`;
                // }

                // 创建透视表
                pivotTable = sheet.pivotTables.add(title, dataRange, rangeToPlacePivot);

                // 第四次同步：确保透视表创建完成
                // await context.sync();
            }

            // 3. 批量添加层次结构
            // 首先收集所有要添加的层次结构
            const hierarchies = {
                rows: rows.map(index => ({
                    type: 'row',
                    name: dataRange.values[0][index - 1],
                    hierarchy: pivotTable.hierarchies.getItem(dataRange.values[0][index - 1])
                })),
                columns: columns.map(index => ({
                    type: 'column',
                    name: dataRange.values[0][index - 1],
                    hierarchy: pivotTable.hierarchies.getItem(dataRange.values[0][index - 1])
                })),
                values: values.map(({ column, summarize_by }) => ({
                    type: 'value',
                    name: dataRange.values[0][column - 1],
                    hierarchy: pivotTable.hierarchies.getItem(dataRange.values[0][column - 1]),
                    summarize_by: ((Excel.AggregationFunction as any)[summarize_by.toLowerCase()]) || Excel.AggregationFunction.sum
                })),
                filters: filters.map(index => ({
                    type: 'filter',
                    name: dataRange.values[0][index - 1],
                    hierarchy: pivotTable.hierarchies.getItem(dataRange.values[0][index - 1])
                }))
            };

            // 批量添加行
            for (const item of hierarchies.rows) {
                pivotTable.rowHierarchies.add(item.hierarchy);
            }

            // 批量添加列
            for (const item of hierarchies.columns) {
                pivotTable.columnHierarchies.add(item.hierarchy);
            }

            // 批量添加值
            for (const item of hierarchies.values) {
                const dataHierarchy = pivotTable.dataHierarchies.add(item.hierarchy);
                dataHierarchy.summarizeBy = item.summarize_by;
            }

            // 批量添加过滤器
            for (const item of hierarchies.filters) {
                pivotTable.filterHierarchies.add(item.hierarchy);
            }

            // 第五次同步：确保所有层次结构都添加完成
            await context.sync();
            await new Promise(resolve => setTimeout(resolve, 1000));

            let chartImages = [];
            // 4. 创建图表
            if (chartConfigs.length > 0) {
                // 等待透视表数据完全加载
                await new Promise(resolve => setTimeout(resolve, 1000));

                const pivotTables = pivotSheet.pivotTables;
                pivotTables.load("items");

                // 第六次同步：加载透视表数据
                await context.sync();

                const pivotTable0 = pivotTables.getItem(title);
                const pivotRange = pivotTable0.layout.getRange();
                pivotRange.load(["address", "left", "width"]);

                // 第七次同步：加载透视表范围
                await context.sync();

                let chartLeft = pixelsToPoints(pivotRange.left + pivotRange.width);

                // 批量创建图表
                const charts = chartConfigs.map((config, index) => {
                    const { chartType, titleSuffix } = config;
                    const chartTypeValue = chartMap[chartType];
                    if (!chartTypeValue) {
                        console.warn(`Unsupported chart type: ${chartType}`);
                        return null;
                    }

                    const chart = pivotSheet.charts.add(
                        chartTypeValue,
                        pivotRange,
                        Excel.ChartSeriesBy.auto
                    );

                    chart.title.text = `${title} ${titleSuffix}`;
                    chart.left = chartLeft + (index * pixelsToPoints(410));
                    chart.top = pixelsToPoints(50);
                    chart.width = pixelsToPoints(360);
                    chart.height = pixelsToPoints(240);

                    return chart;
                }).filter(Boolean);

                // 第八次同步：确保所有图表创建完成
                await context.sync();

                for (const chart of charts) {
                    const base64 = await chart.getImage(600, 400, 'FitAndCenter')
                    await context.sync();
                    chartImages.push({
                        image: `data:image/jpeg;base64,${base64.value}`,
                        title: chart.title.text
                    });
                }
            }

            // 最后激活工作表
            pivotSheet.activate();
            await context.sync();

            return chartImages;

        } catch (error) {
            console.error("Error in createPivotTable:", error);
            throw error;
        }
    });
}

export const openDialog = async (fullUrl: string, options: any = {}, callback?: (result: any) => void): Promise<void> => {
    const { height = 60, width = 30 } = options;
    let loginDialog: Office.Dialog;
    Office.context.ui.displayDialogAsync(fullUrl, { height, width }, function (result) {
        console.log("Dialog has initialized. Wiring up events");
        loginDialog = result.value;
        loginDialog.addEventHandler(Office.EventType.DialogMessageReceived, (event: {
            message: string;
            origin: string;
        }) => {

            loginDialog.close();
            if (callback) {
                callback(event.message);
            }
        });
    });
}