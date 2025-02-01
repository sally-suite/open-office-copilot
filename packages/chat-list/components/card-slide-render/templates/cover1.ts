import { ISlideItem, Slide, SlideElement, TextBlock, Theme } from "chat-list/types/api/slide";
import { titleFontSize } from './constants';
import { corpImageByRatio, getImgSize } from "chat-list/utils";

const calculateLayout = async (imageSrc: string) => {
    const { width, height } = await getImgSize(imageSrc);

    // Handle auto sizes
    if (width === 'auto' || height === 'auto') {
        return {
            imageWidth: 5,
            textWidth: 7.5,
            textX: 5.4
        };
    }

    // Calculate aspect ratio
    const aspectRatio = Number(width) / Number(height);

    // Slide dimensions
    const totalWidth = 13.3;
    const slideHeight = 7.5;

    // Calculate image width based on height and aspect ratio
    let imageWidth = slideHeight * aspectRatio;

    // Ensure image doesn't exceed half the slide width
    imageWidth = Math.min(imageWidth, totalWidth / 2);

    // Calculate text width and position
    const textWidth = Math.max(totalWidth - imageWidth - 0.8, totalWidth / 2 - 0.8);

    const textX = imageWidth + 0.4; // Position text after image with gap

    return {
        imageWidth,
        textWidth,
        textX
    };
};

export async function render(slideItem: ISlideItem, theme: Theme): Promise<Slide> {
    const elements: SlideElement[] = [];
    let yPosition = 2.5;
    const height = 7.5;

    // Calculate layout based on image
    const layout = slideItem.image && slideItem.image.length > 0
        ? await calculateLayout(slideItem.image[0].src)
        : { imageWidth: 5, textWidth: 7.5, textX: 5.4 };

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
    yPosition += 1.3;

    // Add subtitle if exists
    if (slideItem.subtitle) {
        elements.push({
            type: 'text',
            content: slideItem.subtitle,
            style: {
                fontSize: 20,
                color: theme.colors.body,
                fontFamily: theme.fonts.body,
                bold: false
            },
            position: { x: layout.textX, y: yPosition },
            size: { width: layout.textWidth, height: 1 },
        });
        yPosition += 0.6;
    } else {
        yPosition += 0.3;
    }

    // Add images if exist
    if (slideItem.image && slideItem.image.length > 0) {
        const img = slideItem.image[0];
        // const ratio = layout.imageWidth / height;
        // const image = await corpImageByRatio(img.src, ratio, layout.imageWidth * 96, 'cover');
        elements.push({
            type: 'image',
            src: img.src,
            alt: ``,
            position: {
                x: 0,
                y: 0
            },
            size: {
                width: layout.imageWidth,
                height
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
    name: 'Left image with title',
    image: true,
    imageRatio: 0.7,
};