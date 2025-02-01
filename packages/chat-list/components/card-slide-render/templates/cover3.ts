import { ISlideItem, Slide, SlideElement, TextBlock, Theme } from "chat-list/types/api/slide";
import { titleFontSize } from './constants'
import { corpImageByRatio } from "chat-list/utils";


export async function render(slideItem: ISlideItem, theme: Theme): Promise<Slide> {
    const elements: SlideElement[] = [];
    let yPosition = 3.5;
    const height = 7;
    // Add title
    elements.push({
        type: 'title',
        content: slideItem.title,
        style: {
            fontSize: titleFontSize,
            color: theme.colors.title,
            fontFamily: theme.fonts.title,
            align: 'center',
            bold: true,
        },
        position: { x: 1, y: yPosition },
        size: { width: 11.3, height: 0.8 },
    });
    yPosition += 1.3;

    // Add subtitle if exists
    if (slideItem.subtitle) {
        elements.push({
            type: 'text',
            content: slideItem.subtitle,
            style: {
                fontSize: 20,
                color: theme.colors.title,
                fontFamily: theme.fonts.body,
                align: 'center',
                bold: false
            },
            position: { x: 1, y: yPosition },
            size: { width: 11.3, height: 0.6 },
        });
        yPosition += 0.6;
    } else {
        yPosition += 0.3;
    }

    // Add images if exist
    if (slideItem.image && slideItem.image.length > 0) {
        const img = slideItem.image[0];
        const radio = 13.3 / 2.865;
        const image = await corpImageByRatio(img.src, radio, 13.3 * 96, 'cover')
        elements.push({
            type: 'image',
            src: image,
            alt: ``,
            position: {
                x: 0,
                y: 0
            },
            size: {
                width: 13.3,
                height: 2.865
            },
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
    name: 'Top image with title and subtitle',
    image: false,
}