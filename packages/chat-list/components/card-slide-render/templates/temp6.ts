import { ISlideItem, Slide, SlideElement, Theme } from "chat-list/types/api/slide";
import { titleFontSize, contentY } from './constants'

const gapConfig: any = {
    2: 0.4,
    3: 0.3,
    4: 0.2,
}

const marginConfig: any = {
    2: 20,
    3: 15,
    4: 10,
}

export function render(data: ISlideItem, theme?: Theme): Slide {
    const elements: SlideElement[] = [];
    // width :10
    const width = 13.3;
    const gap = gapConfig[data.list.length] || 0.4;
    const margin = marginConfig[data.list.length] || 10;
    const w = width - 1 - gap * (data.list.length - 1);
    const itemWidth = w / (data.list.length);
    elements.push({
        type: 'title',
        content: data.title,
        style: {
            fontSize: titleFontSize,
            color: theme.colors.title,
            fontFamily: theme.fonts.title,
            bold: true,
            italic: false,
            underline: false,
        },
        position: {
            x: 0.5,
            y: 0.5,
        },
        size: {
            width: 11,
            height: 0.8,
        },
    });

    function renderItem(item: any, index: number, x: number, y: number, itemWidth: number) {
        const elements = [];
        elements.push(
            {
                type: 'shape',
                shapeName: 'roundRect',
                style: {
                    fill: {
                        color: theme.colors.highlight
                    },
                    color: theme.colors.body,
                    align: 'center',
                    valign: 'middle',
                    rectRadius: 100
                },
                position: {
                    x,
                    y,
                },
                size: {
                    width: 0.5,
                    height: 0.5,
                },
            },
            {
                type: 'text',
                content: '0' + (index + 1),
                style: {
                    fontSize: 14,
                    color: theme.colors.body,
                    fontFamily: theme.fonts.body,
                    bold: true,
                    margin: 0,
                    valign: 'middle',
                    align: 'center'
                },
                position: {
                    x,
                    y,
                },
                size: {
                    width: 0.5,
                    height: 0.5,
                },
            },
            {
                type: 'title',
                content: item.title,
                style: {
                    fontSize: 18,
                    color: theme.colors.body,
                    fontFamily: theme.fonts.body,
                    bold: true,
                    margin: [margin, 0, 0, 0],
                    valign: 'middle'
                },
                position: {
                    x: x + 0.5,
                    y: y,
                },
                size: {
                    width: itemWidth,
                    height: 0.4,
                },
            },
            {
                type: 'text',
                content: item.description,
                style: {
                    fontSize: 14,
                    color: theme.colors.body,
                    fontFamily: theme.fonts.body,
                    margin: [margin, margin, margin, margin]
                },
                position: {
                    x: x + 0.5,
                    y: y + 0.4,
                },
                size: {
                    width: itemWidth,
                    height: 2,
                },
            }
        )
        return elements;
    }
    if (data.list.length <= 3) {
        data.list.forEach((item, index) => {
            const left = 1 + (index * itemWidth);
            const eles: any = renderItem(item, index, left, contentY + 0.7, itemWidth * 0.8);
            elements.push(...eles)
        })
    } else {
        data.list.forEach((item, index) => {
            if (index % 2 == 0) {
                const left = 1 + (index * itemWidth);
                const eles: any = renderItem(item, index, left, contentY, itemWidth * 1.8);
                elements.push(...eles)
            } else {
                const left = 1 + ((index - 1) * itemWidth);
                const top = contentY + 2.5;
                const eles: any = renderItem(item, index, left, top, itemWidth * 1.8);
                elements.push(...eles)
            }
        })
    }


    return {
        id: 'slide1',
        layout: 'CUSTOM',
        background: {
            color: theme.colors.background
        },
        elements,
        notes: data.notes
    };
}

export default {
    render,
    name: 'Column Card',
    image: false,
}