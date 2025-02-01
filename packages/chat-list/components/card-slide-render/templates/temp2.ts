import { ISlideItem, Slide, SlideElement, Theme } from "chat-list/types/api/slide";
import { titleFontSize, contentY } from './constants';

const gapConfig: any = {
    2: 0.4,
    3: 0.3,
    4: 0.2,
};

const marginConfig: any = {
    2: 20,
    3: 15,
    4: 10,
};

export function render(data: ISlideItem, theme: Theme): Slide {
    const elements: SlideElement[] = [];
    // width :10
    const width = 13.3;
    const gap = gapConfig[data.list.length] || 0.4;
    const margin = marginConfig[data.list.length] || 10;
    const w = width - 1 - gap * (data.list.length - 1);
    const itemWidth = w / data.list.length;
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

    data.list.forEach((item, index) => {
        const x = 0.5 + index * (itemWidth + gap);
        // const bgColor = index % 2 == 0 ? theme.colors.primary : theme.colors.highlight;
        const bgColor = theme.colors.highlight;
        const transparency = 0;
        // const color = index % 2 == 0 ? '#FFFFFF' : theme.colors.body;
        const color = theme.colors.body;

        elements.push(
            {
                type: 'shape',
                shapeName: 'roundRect',
                style: {
                    fill: {
                        color: bgColor,
                        transparency,
                    },
                    rectRadius: 0.1
                },
                position: {
                    x,
                    y: contentY,
                },
                size: {
                    width: itemWidth,
                    height: 4.5,
                },
            },
            {
                type: 'text',
                content: '0' + (index + 1),
                style: {
                    fontSize: 70,
                    color: color,
                    fontFamily: theme.fonts.body,
                    bold: true,
                    margin: [margin, margin, margin, margin]
                },
                position: {
                    x,
                    y: 2,
                },
                size: {
                    width: itemWidth,
                    height: 1.6,
                },
            },
            {
                type: 'title',
                content: item.title,
                style: {
                    fontSize: 18,
                    color: color,
                    fontFamily: theme.fonts.body,
                    bold: true,
                    margin: [margin, 0, margin, 0],
                    valign: 'middle'
                },
                position: {
                    x,
                    y: 3.6,
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
                    color: color,
                    fontFamily: theme.fonts.body,
                    margin: [margin, margin, margin, margin]
                },
                position: {
                    x,
                    y: 4.1,
                },
                size: {
                    width: itemWidth,
                    height: 2,
                },
            }
        );
    });

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
};