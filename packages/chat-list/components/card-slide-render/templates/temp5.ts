import { ISlideItem, Slide, SlideElement, TextBlock, Theme } from "chat-list/types/api/slide";
import { titleFontSize, contentY } from './constants';
import { corpImageByRatio, getImgSize } from "chat-list/utils";

const maxImageRatio = 0.7;
const calculateLayout = async (imageSrc: string) => {
    const { width, height } = await getImgSize(imageSrc);

    // Handle auto sizes
    if (width === 'auto' || height === 'auto') {
        return {
            imageWidth: 5,
            textWidth: 7.5,
            imageX: 8.3, // 13.3 - 5
            textX: 0.5
        };
    }

    // Calculate aspect ratio
    const aspectRatio = Number(width) / Number(height);

    // Slide dimensions
    const totalWidth = 13.3;
    const slideHeight = 7.5;

    // Calculate image width based on height and aspect ratio
    let imageWidth = slideHeight * aspectRatio;

    // Apply maximum width constraint
    const maxAllowedWidth = totalWidth * maxImageRatio;
    if (imageWidth > maxAllowedWidth) {
        imageWidth = maxAllowedWidth;
    }

    // Calculate text width and position
    const textWidth = totalWidth - imageWidth - 0.8; // 0.4 is gap

    const imageX = totalWidth - imageWidth;
    const textX = 0.5;

    return {
        imageWidth,
        textWidth,
        imageX,
        textX
    };
};

export async function render(slideItem: ISlideItem, theme: Theme): Promise<Slide> {
    const elements: SlideElement[] = [];
    let yPosition = 0.5;

    // Calculate layout based on image
    const layout = slideItem.image && slideItem.image.length > 0
        ? await calculateLayout(slideItem.image[0].src)
        : { imageWidth: 5, textWidth: 7.5, imageX: 8.3, textX: 0.5 };

    // Add title
    elements.push({
        type: 'title',
        content: slideItem.title,
        style: {
            fontSize: titleFontSize,
            color: theme.colors.title,
            fontFamily: theme.fonts.title,
            bold: true,
        },
        position: { x: layout.textX, y: yPosition },
        size: { width: layout.textWidth, height: 0.8 },
    });
    yPosition += (contentY - 0.5);

    // Add list items if exist
    if (slideItem.list) {
        const list: TextBlock[] = [];

        // Add description text
        list.push({
            text: slideItem.text,
            type: 'paragraph',
            style: {
                bold: false,
                fontSize: 16,
                spaceBefore: 6,
                spaceAfter: 4,
                color: theme.colors.body,
                fontFamily: theme.fonts.body,
                bullet: false
            }
        });

        // Add bullet points
        slideItem.list.forEach((item) => {
            list.push({
                type: 'heading',
                text: item.title,
                style: {
                    bold: false,
                    fontSize: 16,
                    spaceBefore: 6,
                    spaceAfter: 4,
                    color: theme.colors.body,
                    fontFamily: theme.fonts.body,
                    bullet: true
                }
            });
        });

        elements.push({
            type: 'text',
            content: list,
            style: {
                fontSize: 18,
                color: theme.colors.body,
                fontFamily: theme.fonts.body,
                valign: 'top'
            },
            position: { x: layout.textX, y: yPosition },
            size: { width: layout.textWidth, height: 5.5 },
        });
    }

    // Add images if exist
    if (slideItem.image && slideItem.image.length > 0) {
        const image = slideItem.image[0];
        // const ratio = 7.5 / layout.imageWidth;
        // const img = await corpImageByRatio(image.src, ratio, layout.imageWidth * 96, 'cover');
        elements.push({
            type: 'image',
            src: image.src,
            position: {
                x: layout.imageX,
                y: 0
            },
            size: {
                width: layout.imageWidth,
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
        notes: slideItem.notes
    };
}

export default {
    render,
    name: 'Right image with description and list',
    image: true,
    imageRatio: 0.7,
};