import { ChartTypes } from 'chat-list/types/chart';
import { ToolFunction } from 'chat-list/types/chat';

export default function funcs(titles: string[]): ToolFunction[] {
    return [
        {
            type: 'function',
            function: {
                "name": "addChart",
                "description": `Create a chart according user's input,parameters include chart type, chart title, xAxisTitle, yAxisTitle,yAxisTitles, and other options, Columns incluce:${titles.join(',')}`,
                "parameters": {
                    "type": "object",
                    "properties": {
                        "type": {
                            "type": "string",
                            "description": `Chart type value include :${ChartTypes.join(',')}`
                        },
                        "title": {
                            "type": "string",
                            "description": `Generate title according user's input`
                        },
                        "x_axis_title": {
                            "type": "string",
                            "description": `Column name corresponding to the X-axis`
                        },
                        "y_axis_titles": {
                            "type": "array",
                            "description": `Column names user selected to show in chart at Y-axis`,
                            "items": {
                                "type": "string"
                            }
                        }
                    },
                    "required": [
                        "type",
                        "title",
                        "x_axis_title",
                        "y_axis_titles"
                    ]
                }
            }
        }

    ];
}