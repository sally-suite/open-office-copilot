import { ISlideItem, Slide, SlideElement, TextBlock, Theme } from "chat-list/types/api/slide";
import { titleFontSize, contentY } from './constants';


export default function generateSlide(slideItem: ISlideItem, theme: Theme): Slide {
    const elements: SlideElement[] = [];
    let yPosition = 0.5;
    // const height = 7;
    // const gap = (height - contentY) / slideItem.list.length;
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
    yPosition += contentY;

    // Add subtitle if exists
    // if (slideItem.subtitle) {
    //     elements.push({
    //         type: 'text',
    //         content: slideItem.subtitle,
    //         style: {
    //             fontSize: 20,
    //             fontColor: '#000080',
    //             fontFamily: 'Arial',
    //             bold: false
    //         },
    //         position: { x: 4.3, y: yPosition },
    //         size: { width: 9, height: 0.6 },
    //     });
    //     yPosition += 0.6;
    // } else {
    // yPosition += 0.3;
    // }

    // Add list items if exist
    if (slideItem.list) {
        const list: TextBlock[] = [];
        slideItem.list.forEach((item, index) => {
            list.push(
                {
                    text: item.title,
                    style: {
                        bold: true,
                        fontSize: 18,
                        lineSpacing: 18,
                        spaceBefore: 8,
                        spaceAfter: 8,
                        fontColor: theme.colors.text,
                        fontFamily: theme.fonts.body,
                    }
                },
                {
                    text: item.description,
                    style: {
                        bold: false,
                        fontSize: 12,
                        lineSpacing: 12,
                        spaceBefore: 8,
                        spaceAfter: 8,
                        fontColor: theme.colors.text,
                        fontFamily: theme.fonts.body,
                    }
                }
            );
        });

        elements.push({
            type: 'text',
            content: list,
            style: {
                fontSize: 18,
                fontColor: theme.colors.text,
                fontFamily: theme.fonts.body,
                valign: 'top'
            },
            position: { x: 5.4, y: yPosition },
            size: { width: 7.5, height: 4.8 },
        });
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