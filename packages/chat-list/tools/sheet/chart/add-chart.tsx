import { ChartTypes } from 'chat-list/types/chart';
import sheetApi from '@api/sheet';
import image from 'chat-list/utils/image';
import { ITool } from 'chat-list/types/plugin';
import { buildChatMessage } from 'chat-list/utils';
import CardChart from 'chat-list/components/card-chart'
import React from 'react';
let current = 0;

const width = 360;
const height = 240;
const gap = 10;

const positions: number[][] = [];
// 5 row and 3 column charts layout
const rows = 5, cols = 3;
for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
        positions.push([j * (width + gap) + 30, i * (height + gap) + 30]);
    }
}

// const options = { "type": "Pie", "title": "Sales Distribution", "x_axis_title": "City", "y_axis_titles": ["Sales"] };

export const transferGoogleChart = (options: any): any => {
    try {
        return buildChatMessage(
            <CardChart options={options} autoAdd={false} />,
            'card',
            'assistant'
        );
    } catch (err) {
        return buildChatMessage(`I'm sorry, I can't deal with your request.`, 'text', 'assistant');
    }
};

export async function addChart(agrs: any = {}) {
    const {
        source_range = '',
        type = '',
        title = '',
        x_axis_title = '',
        y_axis_title = '',
        y_axis_titles = [],
        position = undefined,
        explanation = '',
        context
    } = agrs;

    let tarPosition = position;
    if (!tarPosition) {
        tarPosition = positions[current]
        current++;
        if (current > positions.length - 1) {
            current = 0;
        }
    }
    try {
        let address = source_range;
        if (!address) {
            address = await sheetApi.getRangeA1Notation();
        }
        const option = {
            address,
            type,
            title,
            xAxisTitle: x_axis_title,
            yAxisTitle: y_axis_title,
            yAxisTitles: y_axis_titles,
            isStack: false,
            position: tarPosition
        };
        const chartImageUrl = await sheetApi.AddChart(option);
        // context.appendMsg(buildChatMessage(
        //     <CardChart options={option} autoAdd={false} />,
        //     'card',
        //     'assistant'
        // ));
        // console.log(chartImageUrl)
        const imgId = Math.random().toString(36).substring(2, 9);
        const url = image.set(chartImageUrl, `google.chart/${imgId}`)
        return `Here is ${title} chart image link: ![${title}](${url})\n${explanation}`;
    } catch (e) {
        throw new Error(`There are some errors when adding chart,errors:${e.message}`);
    }
}

export default {
    "type": 'function',
    "name": "add_chart",
    "description": `Create a chart according user's input,parameters include chart type, chart title, xAxisTitle, yAxisTitle,yAxisTitles, and other options, return a image link.`,
    "parameters": {
        "type": "object",
        "properties": {
            "source_range": {
                "type": "string",
                "description": `The data ragne of chart,in A1Notation`
            },
            "type": {
                "type": "string",
                "description": `Chart type value include :${ChartTypes.join(',')}`
            },
            "title": {
                "type": "string",
                "description": `Generate title according user's input`
            },
            "x_axis_title": {
                "type": "number",
                "description": `Column number corresponding to the X-axis`
            },
            "y_axis_titles": {
                "type": "array",
                "description": `Column numbers user selected to show in chart at Y-axis`,
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
            "source_range",
            "type",
            "title",
            "x_axis_title",
            "y_axis_titles",
            "explanation"
        ]
    },
    func: addChart
} as ITool;