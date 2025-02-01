import { ISlideItem, Slide, SlideElement, Theme } from "chat-list/types/api/slide";
import { titleFontSize, contentY } from './constants'
import { corpImageByRatio } from "chat-list/utils";

const gapConfig: any = {
    2: 0.4,
    3: 0.3,
    4: 0.2,
}

export async function render(data: ISlideItem, theme: Theme): Promise<Slide> {
    const elements: SlideElement[] = [];
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
    })
    const top = contentY;
    const imageHeight = 2.6;
    const len = Math.min(data.image.length, data.list.length);
    for (let i = 0; i < len; i++) {
        const x = 0.5 + i * (itemWidth + gap);
        const radio = itemWidth / imageHeight;
        const item = data.image[i];
        let img;
        if (item) {
            img = await corpImageByRatio(item.src, radio, itemWidth * 96, 'cover')
        }

        elements.push({
            type: 'image',
            src: img,
            position: {
                x,
                y: top,
            },
            size: {
                width: itemWidth,
                height: imageHeight,
            },
        })
    }
    // data?.image?.forEach((item, i) => {
    //     const x = 0.5 + i * (itemWidth + gap);
    //     elements.push({
    //         type: 'image',
    //         src: item.src,
    //         position: {
    //             x,
    //             y: top,
    //         },
    //         size: {
    //             width: itemWidth,
    //             height: imageHeight,
    //         },
    //     })
    // })
    const titleHeight = 0.6;
    const titleMarginTop = 0.1;
    const titleY = imageHeight + top + titleMarginTop;
    data.list.forEach((item, i) => {
        const x = 0.5 + i * (itemWidth + gap);
        elements.push({
            type: 'title',
            content: item.title,
            style: {
                fontSize: 18,
                color: theme.colors.body,
                fontFamily: theme.fonts.body,
                bold: true,
                valign: 'middle'
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
                fontSize: 14,
                spaceBefore: 6,
                color: theme.colors.body,
                fontFamily: theme.fonts.body,
            },
            position: {
                x,
                y: titleY + titleHeight,
            },
            size: {
                width: itemWidth,
                height: 2,
            },
        })
    })

    return {
        id: 'slide1',
        layout: 'CUSTOM',
        background: {
            color: theme.colors.background,
        },
        elements,
        notes: data.notes
    };
}

export default {
    render,
    name: 'Column with image',
    image: true,
}