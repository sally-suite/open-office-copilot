import { ISlideItem, Slide, SlideElement, TextBlock, Theme } from "chat-list/types/api/slide";
import { titleFontSize } from './constants';


export async function render(slideItem: ISlideItem, theme: Theme): Promise<Slide> {
    const elements: SlideElement[] = [];
    let yPosition = 2.5;
    const height = 7;
    // Add title
    elements.push({
        type: 'title',
        content: slideItem.title,
        style: {
            fontSize: titleFontSize,
            color: theme.colors.primary,
            fontFamily: theme.fonts.title,
            bold: true,
        },
        position: { x: 5.4, y: yPosition },
        size: { width: 7.5, height: 0.8 },
    });
    yPosition += 1.3;

    // Add subtitle if exists
    if (slideItem.text) {
        elements.push({
            type: 'text',
            content: slideItem.text,
            style: {
                fontSize: 20,
                color: theme.colors.highlight,
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
    name: 'Right image with description and list',
    image: false,
};