import { ChartTypeKeys, ChartTypes } from 'chat-list/types/chart';
import { ChatState, ITool } from 'chat-list/types/plugin';
import description from './description.md';
import { addChart } from '../add-chart';
import { getHeaderList } from 'chat-list/service/sheet';
import { buildChatMessage } from 'chat-list/utils';
import { LineChart } from 'lucide-react';
// import CardChart from 'chat-list/components/card-chart'
// import React from 'react';

// import { buildChatMessage } from 'chat-list/utils';
// import { buildChatMessage } from 'chat-list/utils';
export async function main({ source_range = '', charts_params = [], context, from }: { source_range: string, charts_params: any[], from: any, context: ChatState }) {
    // console.log(JSON.stringify(charts_params));
    const headers = await getHeaderList();
    if (!headers || headers.length === 0 || headers.every((item) => item === '' || item === undefined)) {
        const msg = "I'm sorry, I can't detect the table header, you need to select the data range first.";
        context.appendMsg(buildChatMessage(msg, 'text', 'assistant', from));
        throw new Error(msg);
    }

    // create a map for headers
    const headersMap: Record<string, boolean> = headers.reduce((acc, cur) => {
        return {
            [cur]: true,
            ...acc
        };
    }, {});

    const chartParams = charts_params;
    // let chartDefine = "Here is the chart creation information, please check if it is correct, if not, please adjust the table or change the selected range.\n\n";
    let reason = '';
    for (let i = 0; i < charts_params.length; i++) {
        const { type, title = '', x_axis_title = '', y_axis_titles = [] } = charts_params[i];
        const cols = [x_axis_title].concat(y_axis_titles);
        // check cols is exist in headers
        if (!cols.every((item) => headersMap[item])) {
            const msg = `Sorry, some of the headers above do not exist, please check the headers.`;
            // chartDefine += `**${title}**\n- Chart type: ${type}\n- X axis title: ${x_axis_title}\n- Y axis titles: ${y_axis_titles?.join(',')}\n\n`
            // chartDefine += `${msg}\n`;
            reason += msg;
            continue;
        }

        if (!ChartTypeKeys[type]) {
            const msg = `Sorry, this chart type is not supported: ${type}.`;
            // chartDefine += msg;
            reason += msg;
            continue;
        }

        chartParams.push(charts_params[i]);
        // chartDefine += `**${title}**\n- Chart type: ${type}\n- X axis title: ${x_axis_title}\n- Y axis titles: ${y_axis_titles?.join(',')}\n\n`
    }
    // context.appendMsg(buildChatMessage(chartDefine, 'text', 'assistant', from));

    const results = [];
    for (let i = 0; i < chartParams.length; i++) {
        const param = chartParams[i];
        const option = {
            source_range: source_range,
            ...param,
            context
        };
        const result = await addChart(option);
        results.push(result);
    }
    if (results.length > 0) {
        const msg = results.join('\n');
        // context.appendMsg(buildChatMessage(msg, 'text', 'assistant', from));
        return `Here are all charts, show them to user : \n${msg}`;
    }
    return `Sorry, I can't create charts for some reasons:**${reason}**,let tool code interpreter do it.`;
}

export default {
    "type": 'function',
    "name": "recommend_charts",
    "description": description + '\n' + `Chart type value include :${ChartTypes.join(',')}`,
    "tip": "Help me create the charts I want to ",
    "icon": LineChart,
    "parameters": {
        "type": "object",
        "properties": {
            "source_range": {
                "type": "string",
                "description": `The data ragne of chart,in A1Notation`
            },
            "charts_params": {
                "type": "array",
                "description": `Chart creation parameter array,Recommend charts based on your knowledge and current data`,
                "items": {
                    "type": "object",
                    "properties": {
                        "type": {
                            "type": "string",
                            "description": `Chart type,the value is strictly from Chart Type`
                        },
                        "title": {
                            "type": "string",
                            "description": `Generate title according user's input`
                        },
                        "x_axis_title": {
                            "type": "number",
                            "description": `Column number corresponding to the X-axis,the value is strictly from sheet header number`
                        },
                        "y_axis_titles": {
                            "type": "array",
                            "description": `Column numbers user selected to show in chart at Y-axis,the value is strictly from sheet header number`,
                            "items": {
                                "type": "number"
                            }
                        },
                        "explanation": {
                            "type": "string",
                            "description": "Explanation about this chart."
                        }
                    },
                    "required": [
                        "type",
                        "title",
                        "x_axis_title",
                        "y_axis_titles",
                        "explanation"
                    ]
                }
            }
        },
        "required": [
            "source_range",
            "charts_params"
        ]
    },
    func: main
} as unknown as ITool;