/* eslint-disable no-case-declarations */
import { ISlideItem, Slide, SlideElement, Theme } from "chat-list/types/api/slide";
import { titleFontSize } from './constants';
import { generateEChartsOption, renderEChart } from "chat-list/utils/chart";

const SLIDE_WIDTH = 13.3;
const SLIDE_HEIGHT = 7.5;
const MARGIN_X = 0.7;
const MARGIN_Y = 0.6;
const TABLE_WIDTH_RATIO = 0.6;

interface ChartLayout {
    x: number;
    y: number;
    width: number;
    height: number;
}

function calculateChartLayouts(chartCount: number, availableWidth: number, availableHeight: number, startX: number): ChartLayout[] {
    const layouts: ChartLayout[] = [];
    const CHART_SPACING = 0.3; // 图表之间的间距

    switch (chartCount) {
        case 1:
            // 单个图表占满右侧
            layouts.push({
                x: startX,
                y: MARGIN_Y,
                width: availableWidth,
                height: availableHeight
            });
            break;

        case 2:
            // 右侧上下布局
            const heightForTwo = (availableHeight - CHART_SPACING) / 2;
            layouts.push(
                {
                    x: startX,
                    y: MARGIN_Y,
                    width: availableWidth,
                    height: heightForTwo
                },
                {
                    x: startX,
                    y: MARGIN_Y + heightForTwo + CHART_SPACING,
                    width: availableWidth,
                    height: heightForTwo
                }
            );
            break;

        case 3:
        case 4:
            // 四宫格布局
            const gridWidth = (availableWidth - CHART_SPACING) / 2;
            const gridHeight = (availableHeight - CHART_SPACING) / 2;

            // 左上
            layouts.push({
                x: startX,
                y: MARGIN_Y,
                width: gridWidth,
                height: gridHeight
            });

            // 右上
            layouts.push({
                x: startX + gridWidth + CHART_SPACING,
                y: MARGIN_Y,
                width: gridWidth,
                height: gridHeight
            });

            // 左下
            layouts.push({
                x: startX,
                y: MARGIN_Y + gridHeight + CHART_SPACING,
                width: gridWidth,
                height: gridHeight
            });

            // 如果是4个图表，添加右下位置
            if (chartCount === 4) {
                layouts.push({
                    x: startX + gridWidth + CHART_SPACING,
                    y: MARGIN_Y + gridHeight + CHART_SPACING,
                    width: gridWidth,
                    height: gridHeight
                });
            }
            break;
    }

    return layouts;
}

export async function render(slideItem: ISlideItem, theme: Theme): Promise<Slide> {
    const elements: SlideElement[] = [];

    // 计算水平区域宽度
    const contentWidth = SLIDE_WIDTH - (MARGIN_X * 3);
    const chartWidth = contentWidth * TABLE_WIDTH_RATIO;
    const textWidth = contentWidth - chartWidth;

    // 计算表格区域高度
    const tableHeight = SLIDE_HEIGHT - (MARGIN_Y * 2);

    // 计算左侧文本区域
    const titleHeight = 0.8;
    const textSpacing = 0.3;
    let totalTextHeight = titleHeight;
    if (slideItem.text) {
        totalTextHeight += textSpacing + 2.0;
    }
    const textStartY = (SLIDE_HEIGHT - totalTextHeight) / 3;

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
        position: { x: MARGIN_X, y: textStartY },
        size: { width: textWidth, height: titleHeight },
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
                    fontSize: 16,
                    spaceBefore: 6,
                    spaceAfter: 4,
                    color: theme.colors.body,
                    fontFamily: theme.fonts.body,
                    bullet: false
                }
            }],
            style: {
                fontSize: 18,
                color: theme.colors.body,
                fontFamily: theme.fonts.body,
                valign: 'top'
            },
            position: { x: MARGIN_X, y: textStartY + titleHeight + textSpacing },
            size: { width: textWidth, height: 4 },
        });
    }

    // 处理图表
    if (slideItem.data && slideItem.data.length > 0) {
        const chartCount = slideItem.data.length;
        const chartLayouts = calculateChartLayouts(
            chartCount,
            chartWidth,
            tableHeight,
            MARGIN_X * 2 + textWidth
        );

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
    name: 'left desc, right chart',
    image: false,
};
