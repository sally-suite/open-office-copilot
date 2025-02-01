/* eslint-disable no-case-declarations */
import { ISlideItem, Slide, SlideElement, Theme } from "chat-list/types/api/slide";
import { titleFontSize } from './constants';
import { generateEChartsOption, renderEChart } from "chat-list/utils/chart";

const SLIDE_WIDTH = 13.3;
const SLIDE_HEIGHT = 7.5;
const MARGIN_X = 0.4;
const MARGIN_Y = 0.4;
const GRID_SPACING = 0.2;

interface ChartLayout {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface LayoutResult {
    textLayout: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    chartLayouts: ChartLayout[];
}

function areLabelsIdentical(slideItems: { labels: string[], values: any[] }[]): boolean {
    if (slideItems.length === 0) return true;

    const firstLabels = slideItems[0].labels;
    return slideItems.every(item =>
        item.labels.length === firstLabels.length &&
        item.labels.every((label, index) => label === firstLabels[index])
    );
}

function calculateGridDimensions() {
    const availableWidth = SLIDE_WIDTH - (MARGIN_X * 2);
    const availableHeight = SLIDE_HEIGHT - (MARGIN_Y * 2);
    const gridWidth = (availableWidth - GRID_SPACING * 2) / 3;
    const gridHeight = (availableHeight - GRID_SPACING) / 2;

    return { gridWidth, gridHeight, availableWidth, availableHeight };
}

function calculateChartLayouts(chartCount: number): LayoutResult {
    const { gridWidth, gridHeight } = calculateGridDimensions();
    const layouts: ChartLayout[] = [];
    let textLayout;

    switch (chartCount) {
        case 1:
            // 文字占据上方所有空间，图表在下方居中
            textLayout = {
                x: MARGIN_X,
                y: MARGIN_Y,
                width: gridWidth * 3 + GRID_SPACING * 2, // 占满整行
                height: gridHeight - 1
            };

            layouts.push({
                x: MARGIN_X,
                y: MARGIN_Y + gridHeight + GRID_SPACING - 1,
                width: gridWidth * 3 + GRID_SPACING * 2,
                height: gridHeight + 1
            });
            break;

        case 2:
            // 文字占据上方所有空间，两个图表在下方并列
            textLayout = {
                x: MARGIN_X,
                y: MARGIN_Y,
                width: gridWidth * 3 + GRID_SPACING * 2, // 占满整行
                height: gridHeight - 1
            };

            const twoChartWidth = (gridWidth * 3 + GRID_SPACING * 2) / 2;
            layouts.push(
                {
                    x: MARGIN_X,
                    y: MARGIN_Y + gridHeight + GRID_SPACING - 1,
                    width: twoChartWidth - GRID_SPACING / 2,
                    height: gridHeight + 1
                },
                {
                    x: MARGIN_X + twoChartWidth + GRID_SPACING / 2,
                    y: MARGIN_Y + gridHeight + GRID_SPACING - 1,
                    width: twoChartWidth - GRID_SPACING / 2,
                    height: gridHeight + 1
                }
            );
            break;

        case 3:
            // 文字占据上方所有空间，三个图表在下方并列
            textLayout = {
                x: MARGIN_X,
                y: MARGIN_Y,
                width: gridWidth * 3 + GRID_SPACING * 2, // 占满整行
                height: gridHeight - 1
            };

            for (let i = 0; i < 3; i++) {
                layouts.push({
                    x: MARGIN_X + (gridWidth + GRID_SPACING) * i,
                    y: MARGIN_Y + gridHeight + GRID_SPACING - 1,
                    width: gridWidth,
                    height: gridHeight + 1
                });
            }
            break;

        case 4:
            // 文字占据上方两个格子，一个图表在右上角，三个在下方
            textLayout = {
                x: MARGIN_X,
                y: MARGIN_Y,
                width: gridWidth * 2 + GRID_SPACING, // 占据两个格子
                height: gridHeight
            };

            // 右上角的图表
            layouts.push({
                x: MARGIN_X + (gridWidth + GRID_SPACING) * 2,
                y: MARGIN_Y,
                width: gridWidth,
                height: gridHeight
            });

            // 下方三个图表
            for (let i = 0; i < 3; i++) {
                layouts.push({
                    x: MARGIN_X + (gridWidth + GRID_SPACING) * i,
                    y: MARGIN_Y + gridHeight + GRID_SPACING,
                    width: gridWidth,
                    height: gridHeight
                });
            }
            break;
    }

    return { textLayout, chartLayouts: layouts };
}

export async function render(slideItem: ISlideItem, theme: Theme): Promise<Slide> {
    const elements: SlideElement[] = [];
    // const chartCount = slideItem.data?.length || 0;
    const { textLayout, chartLayouts } = calculateChartLayouts(1);

    // 添加标题和描述文本
    const titleHeight = 0.7;
    const textSpacing = 0.2;

    // 添加标题
    elements.push({
        type: 'title',
        content: slideItem.title,
        style: {
            fontSize: titleFontSize,
            color: theme.colors.title,
            fontFamily: theme.fonts.title,
            bold: true,
        },
        position: { x: textLayout.x, y: textLayout.y },
        size: { width: textLayout.width, height: titleHeight },
    });

    // 添加描述文本
    if (slideItem.text) {
        elements.push({
            type: 'text',
            content: [{
                text: slideItem.text,
                type: 'paragraph',
                style: {
                    bold: false,
                    fontSize: 14,
                    spaceBefore: 4,
                    spaceAfter: 2,
                    color: theme.colors.body,
                    fontFamily: theme.fonts.body,
                    bullet: false,
                    valign: 'middle'
                }
            }],
            style: {
                fontSize: 14,
                color: theme.colors.body,
                fontFamily: theme.fonts.body,
                valign: 'middle'
            },
            position: {
                x: textLayout.x,
                y: textLayout.y + titleHeight + textSpacing
            },
            size: {
                width: textLayout.width,
                height: textLayout.height - titleHeight - textSpacing
            },
        });
    }

    // 如果 slideItem.datal里所有的labels是一样的，显示在一个图表的不同的series
    if (areLabelsIdentical(slideItem.data)) {
        const layout = chartLayouts[0];
        const chartType = slideItem.data[0].chart_type || 'bar';
        const config = generateEChartsOption(chartType, slideItem.data, {
            title: '',
            titleColor: theme.colors.title,
            labelColor: theme.colors.body,
        });

        const chartImg = renderEChart({
            ...config,
            width: `${layout.width * 96}px`,
            height: `${layout.height * 96}px`,
            backgroundColor: theme.colors.highlight,
        });

        elements.push({
            type: 'chart',
            chartType: chartType || 'bar',
            chartImage: chartImg,
            data: slideItem.data,
            style: {
                fontSize: 18,
                color: theme.colors.body,
                fontFamily: theme.fonts.body,
                valign: 'top',
                fill: {
                    color: theme.colors.highlight,
                }
            },
            position: { x: layout.x, y: layout.y },
            size: { width: layout.width, height: layout.height },
        });
    } else {
        // 添加图表
        if (slideItem.data && slideItem.data.length > 0) {
            slideItem.data.forEach((item, index) => {
                if (index < chartLayouts.length) {
                    const layout = chartLayouts[index];
                    const chartType = item.chart_type || 'bar';
                    const config = generateEChartsOption(chartType, [item], {
                        title: '',
                        titleColor: theme.colors.title,
                        labelColor: theme.colors.body,
                    });

                    const chartImg = renderEChart({
                        ...config,
                        width: `${layout.width * 96}px`,
                        height: `${layout.height * 96}px`,
                        backgroundColor: theme.colors.highlight,
                    });

                    elements.push({
                        type: 'chart',
                        chartType: item.chart_type || 'bar',
                        chartImage: chartImg,
                        data: [item],
                        style: {
                            fontSize: 18,
                            color: theme.colors.body,
                            fontFamily: theme.fonts.body,
                            valign: 'top',
                            fill: {
                                color: theme.colors.highlight,
                            }
                        },
                        position: { x: layout.x, y: layout.y },
                        size: { width: layout.width, height: layout.height },
                    });
                }
            });
        }
    }


    return {
        id: '',
        layout: 'CUSTOM',
        background: {
            color: theme.colors.background
        },
        elements: elements,
        notes: slideItem.notes
    };
}

export default {
    render,
    name: 'top desc ,bottom chart',
    image: false,
};

