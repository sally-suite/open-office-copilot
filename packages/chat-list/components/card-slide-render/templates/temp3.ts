import { ISlideItem, Slide, SlideElement, TextBlock, Theme } from "chat-list/types/api/slide";
import { titleFontSize, contentY } from './constants';
import { corpImageByRatio, cropImage, getImgSize } from "chat-list/utils";

const maxImageRatio = 0.7;
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
    const totalWidth = 13.3; // Total available width
    const slideHeight = 7.5;

    // Calculate initial image width based on height and aspect ratio
    let imageWidth = slideHeight * aspectRatio;

    // Apply maximum width constraint
    const maxAllowedWidth = totalWidth * maxImageRatio;
    if (imageWidth > maxAllowedWidth) {
        imageWidth = maxAllowedWidth;
    }

    // Calculate text width and position
    const textWidth = totalWidth - imageWidth - 0.8; // 0.8 is gap
    const textX = imageWidth + 0.4; // Position text after image with gap

    return {
        imageWidth,
        textWidth,
        textX
    };
};

export async function render(slideItem: ISlideItem, theme: Theme): Promise<Slide> {
    const elements: SlideElement[] = [];
    let yPosition = 0.5;

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
    yPosition += (contentY - 0.5);

    // Add list items if exist
    if (slideItem.list) {
        const list: TextBlock[] = [];
        slideItem.list.forEach((item) => {
            list.push(
                {
                    text: item.title,
                    type: 'heading',
                    style: {
                        bold: true,
                        fontSize: 18,
                        spaceBefore: 6,
                        spaceAfter: 4,
                        color: theme.colors.body,
                        fontFamily: theme.fonts.body,
                    }
                },
                {
                    text: item.description,
                    type: 'paragraph',
                    style: {
                        bold: false,
                        fontSize: 14,
                        spaceBefore: 6,
                        spaceAfter: 4,
                        color: theme.colors.body,
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
        const img = slideItem.image[0];
        // const ratio = 7.5 / layout.imageWidth;
        // const tarImg = await corpImageByRatio(img.src, ratio, layout.imageWidth * 96, 'contain');
        elements.push({
            type: 'image',
            src: img.src,
            position: {
                x: 0,
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
    name: 'Left image with list',
    image: true,
    imageRatio: 0.7,
};