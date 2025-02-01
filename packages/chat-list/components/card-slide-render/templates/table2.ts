import { ICellOption, ISlideItem, ITableCell, Slide, SlideElement, TextBlock, Theme } from "chat-list/types/api/slide";
import { titleFontSize, contentY } from './constants';

const SLIDE_WIDTH = 13.3;
const SLIDE_HEIGHT = 7.5;
const MARGIN_X = 0.7;
const MARGIN_Y = 0.6; // 上下边距
const TABLE_WIDTH_RATIO = 0.6;

export async function render(slideItem: ISlideItem, theme: Theme): Promise<Slide> {
    const elements: SlideElement[] = [];

    // 计算水平区域宽度
    const contentWidth = SLIDE_WIDTH - (MARGIN_X * 3);
    const tableWidth = contentWidth * TABLE_WIDTH_RATIO;
    const textWidth = contentWidth - tableWidth;

    // 计算表格区域高度
    const tableHeight = SLIDE_HEIGHT - (MARGIN_Y * 2);

    // 计算左侧文本区域的总高度并确定起始位置
    const titleHeight = 0.8;
    const textSpacing = 0.3; // 标题和描述文本之间的间距
    let totalTextHeight = titleHeight;
    if (slideItem.text) {
        totalTextHeight += textSpacing + 2.0; // 假设描述文本高度为2.0
    }
    const textStartY = (SLIDE_HEIGHT - totalTextHeight) / 2; // 垂直居中

    // Add title (现在在左侧区域内)
    elements.push({
        type: 'title',
        content: slideItem.title,
        style: {
            fontSize: titleFontSize,
            color: theme.colors.title,
            fontFamily: theme.fonts.title,
            bold: true,
            align: 'center'
        },
        position: { x: MARGIN_X, y: textStartY },
        size: { width: textWidth, height: titleHeight },
    });

    // Add description text if exists
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
                    bullet: false,
                    align: 'center'
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

    // Add table on the right if exists
    if (slideItem.table && slideItem.table.length > 0) {
        const rows = slideItem.table.map((rows: string[], i) => {
            return rows.map((cell, cellIndex) => {
                const isFirstRow = i === 0;
                const isLastRow = i === slideItem.table.length - 1;
                const isFirstCell = cellIndex === 0;
                const isLastCell = cellIndex === rows.length - 1;

                return {
                    text: cell,
                    options: {
                        valign: 'center',
                        border: [
                            { // top border
                                type: isFirstRow ? 'none' : 'dash',
                                pt: 1,
                                color: theme.colors.body,
                            },
                            { // right border
                                type: isLastCell ? 'none' : 'dash',
                                pt: 1,
                                color: theme.colors.body,
                            },
                            { // bottom border
                                type: isLastRow ? 'none' : 'dash',
                                pt: 1,
                                color: theme.colors.body,
                            },
                            { // left border
                                type: isFirstCell ? 'none' : 'dash',
                                pt: 1,
                                color: theme.colors.body,
                            }
                        ],
                        align: i == 0 ? 'center' : 'left',
                        // fontFace: i == 0 ? theme.fonts.title : theme.fonts.body,
                        bold: i == 0,
                        color: theme.colors.body,
                    }
                }
            })
        }) as unknown as ITableCell[][];

        elements.push({
            type: 'table',
            table: {
                rows,
                options: {
                    fontFace: 'Arial',
                    border: {
                        type: 'none',
                        pt: 0,
                        color: theme.colors.body,
                    }
                }
            },
            style: {
                fontSize: 18,
                color: theme.colors.body,
                fontFamily: 'Arial',
                valign: 'top',
                fill: {
                    color: theme.colors.highlight,
                }
            },
            position: { x: MARGIN_X * 2 + textWidth, y: MARGIN_Y },
            size: { width: tableWidth, height: tableHeight },
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
    name: 'configurable split layout',
    image: false,
};