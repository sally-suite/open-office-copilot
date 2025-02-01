import { ISlideItem, Slide, Theme } from "chat-list/types/api/slide";
import { titleFontSize, contentY } from './constants'

const gapConfig: any = {
    2: 0.4,
    3: 0.3,
    4: 0.2,
}

export default function render(data: ISlideItem, theme: Theme): Slide {

    const elements: any = [];
    // width :10
    const width = 13.3;
    const gap = gapConfig[data.list.length] || 0.3;
    const w = width - 1 - gap * (data.list.length - 1);
    const itemWidth = w / data.list.length;
    elements.push({
        type: 'title',
        content: data.title,
        style: {
            fontSize: titleFontSize,
            fontColor: theme.colors.primary,
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
    })
    const top = contentY;
    const imageHeight = 3.1;
    data.image.forEach((item, i) => {
        const x = 0.5 + i * (itemWidth + gap);
        elements.push({
            type: 'image',
            src: item.src,
            position: {
                x,
                y: top,
            },
            size: {
                width: itemWidth,
                height: imageHeight,
            },
        })
    })
    const titleHeight = 0.5;
    const titleMarginTop = 0.2;
    const titleY = imageHeight + top + titleMarginTop;
    data.list.forEach((item, i) => {
        const x = 0.5 + i * (itemWidth + gap);
        elements.push({
            type: 'text',
            content: item.title,
            style: {
                fontSize: 18,
                fontColor: theme.colors.text,
                fontFamily: theme.fonts.body,
                bold: true,
            },
            position: {
                x,
                y: titleY,
            },
            size: {
                width: itemWidth,
                height: titleHeight,
            },
        })
        elements.push({
            type: 'text',
            content: item.description,
            style: {
                fontSize: 12,
                fontColor: theme.colors.text,
                fontFamily: theme.fonts.body,
            },
            position: {
                x,
                y: titleY + titleHeight,
            },
            size: {
                width: itemWidth,
                height: 1,
            },
        })
    })

    return {
        id: 'slide1',
        layout: 'CUSTOM',
        background: {
            color: theme.colors.background,
        },
        elements
    };
}