import sheetApi from '@api/sheet';
import { ChatState, ITool } from 'chat-list/types/plugin';
import { arrayToMarkdownTable, buildChatMessage } from 'chat-list/utils';
import { ChartTypeKeys, ChartTypes } from 'chat-list/types/chart';
import description from './description.md';
import { LineChart } from 'lucide-react';
import image from 'chat-list/utils/image';

const SUMMRIZE_FUNCTIONS = [
    'SUM',
    'AVERAGE',
    'MAX',
    'MIN',
    'COUNT',
    'COUNTA',
    'COUNTUNIQUE',
    'MEDIAN',
    'PRODUCT',
    'STDEV',
    'STDEVP',
    'VAR',
    'VARP'
];

const SHOW_AS = [
    'DEFAULT',
    'PERCENT_OF_ROW_TOTAL',
    'PERCENT_OF_COLUMN_TOTAL',
    'PERCENT_OF_GRAND_TOTAL',
];

interface IPivotTableParams {
    title?: string;
    source_range?: string;
    rows?: number[];
    columns?: number[];
    values?: IValuesParams[];
    filters?: number[];
    explanation?: string;
    context?: ChatState;
    chartConfig?: {
        chartType: any;
        chartTitle: string;
    }
}


interface IValuesParams {
    column: number;
    title: string;
    summarize_by: string;
    show_as: string;
}


export async function func(agrs: IPivotTableParams = {}) {
    const {
        title = '',
        source_range = '',
        rows = [],
        columns = [],
        values = [],
        filters = [],
        explanation = '',
        chartConfig,
        context
    } = agrs;
    //     const content = `
    // **${title || 'Pivot table design'}:**

    // - Rows: ${rows.join(', ') || 'None'}
    // - Columns: ${columns.join(', ') || 'None'}
    // - Values: ${values.map(p => `${p.title}<${p.summarize_by},${p.show_as}>`).join(', ') || 'None'}
    // - Filters: ${filters.join(', ') || 'None'}

    // **Explanation:**

    // ${explanation}`

    //     context.appendMsg(buildChatMessage(content, 'text', 'assistant'));
    // console.log({ title, source_range, rows, columns, values, filters, chartConfig })
    const chart = await sheetApi.createPivotTable({ title, source_range, rows, columns: [], values, filters, chartConfig });
    if (chart) {
        // console.log(chart)
        let result = '';
        if (chart.title && chart.image) {
            const chartTitle = chart.title;
            const imgId = Math.random().toString(36).substring(2, 9);
            const url = image.set(chart.image, `pivote.chart/${imgId}`);
            result += `\n\nHere is ${chartTitle} chart image: ![${chartTitle}](${url})`;
        }

        if (chart.values && chart.values.length > 0) {
            result += `\n\nHere is summary table:\n\n${arrayToMarkdownTable(chart.values as any, true)}`;
        }
        // context.appendMsg(buildChatMessage(result, 'text', 'assistant'));
        return "Task done," + result;
    }
    return explanation;
}

export default {
    "type": "function",
    "name": "generate_pivot_table",
    "description": "Create a pivot table and charts to analyze and summarize data by organizing fields into rows, columns, values and filters. The resulting table will show aggregated values (like sum, average, count) at intersections of row and column groups. Charts will be recommended based on your data structure and analysis goals. Prefer to use rows as the x-axis",
    "tip": "Create a pivot table to analyze and visualize your data. Specify how you want to organize, summarize, and display the information.",
    "icon": LineChart,
    "parameters": {
        "type": "object",
        "properties": {
            "title": {
                "type": "string",
                "description": "Title of the pivot table",
                "minLength": 1,
                "maxLength": 100
            },
            "source_range": {
                "type": "string",
                "description": "Source data range in A1 notation (e.g., 'A1:H50' or 'Sheet1!A1:H50'), only one data range.",
                "pattern": "^([A-Za-z0-9]+!)?[A-Z]+[0-9]+:[A-Z]+[0-9]+$"
            },
            "rows": {
                "type": "array",
                "description": "Column numbers (1-based) to group rows. For example,prefer to use rows,if your first column is your grouping field, use 1.",
                "items": {
                    "type": "number",
                    "minimum": 1,
                    "description": "Column number (starting from 1) to use as a row group"
                },
                "minItems": 1
            },
            // "columns": {
            //     "type": "array",
            //     "description": "Column numbers (1-based) to create column headers. Each unique value in these columns will become a column header.Default is empty,don't set numbers as column headers",
            //     "items": {
            //         "type": "number",
            //         "minimum": 1,
            //         "description": "Column number (starting from 1) to use for column headers,it's value is not same as rows"
            //     }
            // },
            "values": {
                "type": "array",
                "description": "Metrics to calculate and display in the pivot table cells",
                "items": {
                    "type": "object",
                    "properties": {
                        "column": {
                            "type": "number",
                            "description": "Column number (starting from 1) containing the values to summarize",
                            "minimum": 1
                        },
                        "title": {
                            "type": "string",
                            "description": "Display title for this value column",
                            "minLength": 1
                        },
                        "summarize_by": {
                            "type": "string",
                            "description": `Aggregation function to apply to the values. Options: ${SUMMRIZE_FUNCTIONS.join(', ')}`,
                            "enum": SUMMRIZE_FUNCTIONS
                        },
                        "show_as": {
                            "type": "string",
                            "description": `Optional display transformations to apply to the values. Default is DEFAULT `,
                            "enum": SHOW_AS
                        }
                    },
                    "required": ["column", "title", "summarize_by"]
                },
                "minItems": 1
            },
            "filters": {
                "type": "array",
                "description": "Column numbers (1-based) to add as filter fields above the pivot table",
                "items": {
                    "type": "number",
                    "minimum": 1,
                    "description": "Column number (starting from 1) to use as a filter"
                }
            },
            "chartConfig": {
                "type": "object",
                "description": "Chart to display alongside the pivot table",
                "properties": {
                    "chartType": {
                        "type": "string",
                        "description": `Type of chart to create.`,
                        "enum": ChartTypes
                    },
                    "chartTitle": {
                        "type": "string",
                        "description": "Chart title",
                        "maxLength": 100
                    }
                },
                "required": ["chartTitle", "chartType"]
            },
            "explanation": {
                "type": "string",
                "description": "Description of the pivot table design and analysis goals",
                "minLength": 10,
                "maxLength": 1000
            }
        },
        "required": [
            "title",
            "source_range",
            "rows",
            "values",
            "explanation",
            "chartConfig"
        ]
    },
    func
} as ITool;