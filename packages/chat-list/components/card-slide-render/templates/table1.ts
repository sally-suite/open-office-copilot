import { ICellOption, ISlideItem, ITableCell, Slide, SlideElement, TextBlock, Theme } from "chat-list/types/api/slide";
import { titleFontSize, contentY } from './constants';

const SLIDE_WIDTH = 13.3;
const SLIDE_HEIGHT = 7.5;
const MARGIN_X = 0.7;

export async function render(slideItem: ISlideItem, theme: Theme): Promise<Slide> {
    const elements: SlideElement[] = [];
    let yPosition = 0.5;
    const contentWidth = SLIDE_WIDTH - (MARGIN_X * 2);

    // Add title
    elements.push({
        type: 'title',
        content: slideItem.title,
        style: {
            fontSize: titleFontSize,
            color: theme.colors.title,
            fontFamily: theme.fonts.title,
            bold: true,
        },
        position: { x: MARGIN_X, y: yPosition },
        size: { width: contentWidth, height: 0.8 },
    });

    // Update yPosition for description
    yPosition = contentY;

    // Add description text if exists
    if (slideItem.text) {
        const descriptionHeight = 1.5; // Allocate fixed height for description
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
            position: { x: MARGIN_X, y: yPosition },
            size: { width: contentWidth, height: descriptionHeight },
        });

        // Update yPosition for table
        yPosition += descriptionHeight + 0.1;
    }

    // Add table if exists
    if (slideItem.table && slideItem.table.length > 0) {
        const remainingHeight = SLIDE_HEIGHT - yPosition - 0.5; // Calculate remaining space for table
        const rows = slideItem.table.map((rows: string[], i) => {
            return rows.map((cell, cellIndex) => {
                // 计算当前单元格的位置，用于确定需要显示哪些边框
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
                };
            });
        }) as unknown as ITableCell[][];

        elements.push({
            type: 'table',
            table: {
                rows,
                options: {
                    fontFace: 'Arial',
                    border: {
                        type: 'none', // 移除表格整体边框
                        pt: 0,
                        color: theme.colors.highlight,
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
            position: { x: MARGIN_X, y: yPosition },
            size: { width: contentWidth, height: remainingHeight },
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
    name: 'top description, bottom table',
    image: false,
};