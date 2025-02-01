import { ISlideItem, Slide, SlideElement, TextBlock, Theme } from "chat-list/types/api/slide";
import { corpImageByRatio } from "chat-list/utils";

export async function render(data: ISlideItem, theme?: Theme): Promise<Slide> {
    const elements: SlideElement[] = [];
    // width :10
    const width = 13.3;
    const height = 7.5;

    if (data.image.length > 0) {
        const img = data.image[0];
        const ratio = width / height;
        const tarImg = await corpImageByRatio(img.src, ratio, width * 96, 'cover');
        elements.push({
            type: 'image',
            src: tarImg,
            position: {
                x: 0,
                y: 0,
            },
            size: {
                width,
                height,
            },
        });
    } else {
        elements.push({
            type: 'image',
            src: '',
            position: {
                x: 0,
                y: 0,
            },
            size: {
                width,
                height,
            },
        });
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
                    color: theme.colors.body,
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
        ];

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
                position: { x: 0.5, y: 2.5 },
                size: { width: 4.8, height: 2.4 },
            },
            {
                type: 'text',
                content: list,
                style: {
                    fontSize: 18,
                    rectRadius: 0.1,
                    color: theme.colors.body,
                    fontFamily: theme.fonts.body,
                    valign: 'middle'
                },
                position: { x: 0.5, y: 2.5 },
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
    name: 'One image with text',
    image: true,
};