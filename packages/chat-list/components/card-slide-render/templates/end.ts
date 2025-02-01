import { ISlideItem, Slide, SlideElement, TextBlock, Theme } from "chat-list/types/api/slide";
import { titleFontSize } from './constants'


export async function render(slideItem: ISlideItem, theme: Theme): Promise<Slide> {
    const elements: SlideElement[] = [];
    const yPosition = 3.2;
    const height = 7;
    // Add title
    elements.push({
        type: 'title',
        content: slideItem.title,
        style: {
            fontSize: 40,
            color: theme.colors.primary,
            fontFamily: theme.fonts.title,
            bold: true,
            align: 'center'
        },
        position: { x: 1, y: yPosition },
        size: { width: 11.3, height: 0.8 },
    });

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
    name: 'End',
    image: false,
}