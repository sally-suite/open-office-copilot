import { ISlideItem, Slide, SlideElement, TextBlock, Theme } from "chat-list/types/api/slide";
import { titleFontSize } from './constants'


export default function generateSlide(slideItem: ISlideItem, theme: Theme): Slide {
    const elements: SlideElement[] = [];
    let yPosition = 2.5;
    const height = 7;
    // Add title
    elements.push({
        type: 'title',
        content: slideItem.title,
        style: {
            fontSize: titleFontSize,
            fontColor: theme.colors.primary,
            fontFamily: theme.fonts.title,
            bold: true,
        },
        position: { x: 5.4, y: yPosition },
        size: { width: 7.5, height: 0.8 },
    });
    yPosition += 1.3;

    // Add subtitle if exists
    if (slideItem.subtitle) {
        elements.push({
            type: 'text',
            content: slideItem.subtitle,
            style: {
                fontSize: 20,
                fontColor: theme.colors.highlight,
                fontFamily: theme.fonts.body,
                bold: false
            },
            position: { x: 5.4, y: yPosition },
            size: { width: 9, height: 0.6 },
        });
        yPosition += 0.6;
    } else {
        yPosition += 0.3;
    }

    // Add images if exist
    if (slideItem.image && slideItem.image.length > 0) {
        const img = slideItem.image[0];
        elements.push({
            type: 'image',
            src: img.src,
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
        id: '',
        layout: 'CUSTOM',
        background: {
            color: theme.colors.background
        },
        elements: elements,
    };
}