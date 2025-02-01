import { ISlideItem, Slide, SlideElement, Theme } from "chat-list/types/api/slide";
import { titleFontSize, contentY } from './constants';
import { corpImageByRatio } from "chat-list/utils";

const gapConfig: any = {
    2: 0.4,
    3: 0.3,
    4: 0.2,
};

const marginConfig: any = {
    2: 15,
    3: 10,
    4: 5,
};

export async function render(data: ISlideItem, theme?: Theme): Promise<Slide> {
    const elements: SlideElement[] = [];
    // width :10
    const width = 13.3;
    const height = 7.5;
    const gap = gapConfig[data.list.length] || 0.4;
    const margin = marginConfig[data.list.length] || 10;
    // const w = width - 5 - 0.5 * 2;
    const itemWidth = width - 5 - gap * 2;
    const itemHeight = (height - 2) / data.list.length;
    const left = 5 + gap;
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
            x: left,
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
                        color: theme.colors.highlight,
                    },
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
        );
        return elements;
    }
    if (data.list.length <= 3) {
        data.list.forEach((item, index) => {
            // const left = 1 + (index * itemWidth);
            const top = contentY + (index * itemHeight);
            const eles: any = renderItem(item, index, left, top, 6);
            elements.push(...eles);
        });
    } else {
        data.list.forEach((item, index) => {
            if (index % 2 == 0) {
                const top = contentY + (index * itemHeight);
                const eles: any = renderItem(item, index, left, top, itemWidth / 2 * 0.8);
                elements.push(...eles);
            } else {
                const left = 5.5 + gap + itemWidth / 2 * 0.8;
                const top = contentY + ((index - 1) * itemHeight);
                const eles: any = renderItem(item, index, left, top, itemWidth / 2 * 0.8);
                elements.push(...eles);
            }
        });
    }

    if (data.image && data.image.length > 0) {
        const img = data.image[0];
        const ratio = 5 / 7.5;
        const tarImg = await corpImageByRatio(img.src, ratio, 5 * 96);
        elements.push({
            type: 'image',
            src: tarImg,
            alt: ``,
            position: {
                x: 0,
                y: 0
            },
            size: {
                width: 5,
                height: 7.5
            },
        });
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
    name: 'Left image with column',
    image: true,
    imageRatio: 0.7,
};