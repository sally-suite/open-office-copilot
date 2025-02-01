import { ISlideItem, Slide, SlideElement, TextBlock, Theme } from "chat-list/types/api/slide";
import { titleFontSize } from './constants';


export default function generateSlide(slideItem: ISlideItem, theme: Theme): Slide {
    const elements: SlideElement[] = [];
    const yPosition = 3.2;
    const height = 7;
    // Add title
    elements.push({
        type: 'title',
        content: slideItem.title,
        style: {
            fontSize: 40,
            fontColor: theme.colors.primary,
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
    };
}