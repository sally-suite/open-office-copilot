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

const positionConfig: any = {
    2: [
        {
            x: 0,
            y: 0,
            width: 0,
            height: 0
        },
        {
            x: 0,
            y: 0,
            width: 0,
            height: 0
        },
        {
            x: 0,
            y: 0,
            width: 0,
            height: 0
        }
    ],
    3: [
        {
            x: 0.05,
            y: 0.05,
            width: 9.475,
            height: 7.4
        },
        {
            x: 9.575,
            y: 0.05,
            width: 3.675,
            height: 3.675
        },
        {
            x: 9.575,
            y: 3.775,
            width: 3.675,
            height: 3.675,
        }
    ]
};

export async function render(data: ISlideItem, theme?: Theme): Promise<Slide> {
    const elements: SlideElement[] = [];
    // width :10
    const width = 13.3;
    const height = 7.5;
    const gap = gapConfig[data.list.length] || 0.4;
    // const w = width - 5 - 0.5 * 2;

    const posMap = positionConfig[3];
    data.image.slice(0, 3).forEach((item, i) => {
        const pos = posMap[i];
        elements.push({
            type: 'image',
            src: item.src,
            position: {
                x: pos.x,
                y: pos.y,
            },
            size: {
                width: pos.width,
                height: pos.height,
            },
        });
    });
    if (data.title) {
        const list = [
            {
                text: data.title,
                style: {
                    bold: true,
                    fontSize: 18,
                    lineSpacing: 18,
                    // spaceBefore: 8,
                    // spaceAfter: 8,
                    fontColor: '#FFFFFF',
                    fontFamily: theme.fonts.body,

                    fill: {
                        color: theme.colors.primary,
                        transparency: 50,
                    },
                    margin: [10, 10, 10, 10],
                }
            },
            {
                text: data.text,
                style: {
                    bold: false,
                    fontSize: 12,
                    lineSpacing: 12,
                    // spaceBefore: 8,
                    // spaceAfter: 8,
                    fontColor: '#FFFFFF',
                    fontFamily: theme.fonts.body,
                    fill: {
                        color: theme.colors.primary,
                        transparency: 0,
                    },
                    margin: [10, 10, 10, 10],
                }
            }
        ];

        elements.push({
            type: 'text',
            content: list,
            style: {
                fontSize: 18,
                fontColor: '#FFFFFF',
                fontFamily: theme.fonts.body,
                valign: 'middle',
                fill: {
                    color: theme.colors.primary,
                    transparency: 0,
                },

            },
            position: { x: 0.5, y: 4.6 },
            size: { width: 4.8, height: 2.4 },
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
    name: 'Column Card',
    image: false,
};