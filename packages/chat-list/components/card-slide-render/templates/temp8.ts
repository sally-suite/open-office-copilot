import { ISlideItem, Slide, SlideElement, TextBlock, Theme } from "chat-list/types/api/slide";
import { corpImageByRatio } from "chat-list/utils";

const gapConfig: any = {
    2: 0.4,
    3: 0.3,
    4: 0.2,
}

const marginConfig: any = {
    2: 15,
    3: 10,
    4: 5,
}

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
}

export async function render(data: ISlideItem, theme?: Theme): Promise<Slide> {
    const elements: SlideElement[] = [];
    // width :10
    const width = 13.3;
    const height = 7.5;
    const gap = gapConfig[data.list.length] || 0.4;
    // const w = width - 5 - 0.5 * 2;

    const posMap = positionConfig[3];
    // data.image.slice(0, 3).forEach((item, i) => {
    //     const pos = posMap[i];
    //     elements.push({
    //         type: 'image',
    //         src: item.src,
    //         position: {
    //             x: pos.x,
    //             y: pos.y,
    //         },
    //         size: {
    //             width: pos.width,
    //             height: pos.height,
    //         },
    //     })
    // })
    for (let i = 0; i < 3; i++) {
        const pos = posMap[i];
        const img = data.image[i];
        if (!img) {
            elements.push({
                type: 'image',
                src: '',
                position: {
                    x: pos.x,
                    y: pos.y,
                },
                size: {
                    width: pos.width,
                    height: pos.height,
                },
            })
            continue;
        }
        const ratio = pos.width / pos.height;
        const tarImg = await corpImageByRatio(img.src, ratio, pos.width * 96, 'cover');
        elements.push({
            type: 'image',
            src: tarImg,
            position: {
                x: pos.x,
                y: pos.y,
            },
            size: {
                width: pos.width,
                height: pos.height,
            },
        })

    }

    if (data.title) {
        const list: TextBlock[] = [
            {
                text: data.title,
                type: 'heading',
                style: {
                    bold: true,
                    fontSize: 18,
                    lineSpacing: 18,
                    // spaceBefore: 8,
                    // spaceAfter: 8,
                    color: theme.colors.title,
                    fontFamily: theme.fonts.body,
                    margin: [10, 10, 10, 10],
                }
            },
            {
                text: data.text,
                type: 'paragraph',
                style: {
                    bold: false,
                    fontSize: 12,
                    lineSpacing: 12,
                    // spaceBefore: 8,
                    // spaceAfter: 8,
                    color: theme.colors.body,
                    fontFamily: theme.fonts.body,
                    margin: [10, 10, 10, 10],
                }
            }
        ]

        elements.push(
            {
                type: 'shape',
                shapeName: 'roundRect',
                style: {
                    fill: {
                        color: theme.colors.highlight,
                    },
                    rectRadius: 0.1
                },
                position: { x: 0.5, y: 4.6 },
                size: { width: 4.8, height: 2.4 },
            },
            {
                type: 'text',
                content: list,
                style: {
                    fontSize: 18,
                    color: theme.colors.body,
                    fontFamily: theme.fonts.body,
                    valign: 'middle',
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
    name: 'Three images with text',
    image: true,
}