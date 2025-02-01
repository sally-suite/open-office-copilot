import { ISlideItem, Slide, SlideElement, Theme } from "chat-list/types/api/slide";
import { titleFontSize, contentY } from './constants';

const slide = {
    id: 'slide1',
    layout: 'CUSTOM',
    background: {
        color: '#E0F2F1',
    },
    elements: [
        {
            type: 'text',
            content: '一维定态问题',
            style: {
                fontSize: 40,
                fontColor: '#004D40',
                fontFamily: 'Arial',
                bold: true,
                italic: false,
                underline: false,
            },
            position: {
                x: 0.5,
                y: 0.5,
            },
            size: {
                width: 9,
                height: 0.8,
            },
        },
        {
            type: 'shape',
            shapeName: 'rect',
            style: {
                fill: {
                    color: '#B2DFDB'
                },
            },
            position: {
                x: 0.5,
                y: 2.5,
            },
            size: {
                width: 3,
                height: 2.5,
            },
        },
        {
            type: 'text',
            content: '01',
            style: {
                fontSize: 36,
                fontColor: '#004D40',
                fontFamily: 'Arial',
                bold: true,
            },
            position: {
                x: 0.7,
                y: 2.7,
            },
            size: {
                width: 2.6,
                height: 0.6,
            },
        },
        {
            type: 'text',
            content: '定态问题的定义',
            style: {
                fontSize: 18,
                fontColor: '#00695C',
                fontFamily: 'Arial',
                bold: true,
            },
            position: {
                x: 0.7,
                y: 3.3,
            },
            size: {
                width: 2.6,
                height: 0.4,
            },
        },
        {
            type: 'text',
            content: '粒子在某个势场中，如果能量和动量都是确定的，称为定态，反之称为非定态',
            style: {
                fontSize: 14,
                fontColor: '#00695C',
                fontFamily: 'Arial',
            },
            position: {
                x: 0.7,
                y: 3.7,
            },
            size: {
                width: 2.6,
                height: 1.2,
            },
        },
        {
            type: 'shape',
            shapeName: 'rect',
            style: {
                fill: {
                    color: '#E0F2F1'
                },
            },
            position: {
                x: 3.7,
                y: 2.5,
            },
            size: {
                width: 3,
                height: 2.5,
            },
        },
        {
            type: 'text',
            content: '02',
            style: {
                fontSize: 36,
                fontColor: '#004D40',
                fontFamily: 'Arial',
                bold: true,
            },
            position: {
                x: 3.9,
                y: 2.7,
            },
            size: {
                width: 2.6,
                height: 0.6,
            },
        },
        {
            type: 'text',
            content: '一维定态问题',
            style: {
                fontSize: 18,
                fontColor: '#00695C',
                fontFamily: 'Arial',
                bold: true,
            },
            position: {
                x: 3.9,
                y: 3.3,
            },
            size: {
                width: 2.6,
                height: 0.4,
            },
        },
        {
            type: 'text',
            content: '薛定谔方程在一维定态问题中的应用，可以得出粒子的能量和波函数的形状',
            style: {
                fontSize: 14,
                fontColor: '#00695C',
                fontFamily: 'Arial',
            },
            position: {
                x: 3.9,
                y: 3.7,
            },
            size: {
                width: 2.6,
                height: 1.2,
            },
        },
        {
            type: 'shape',
            shapeName: 'rect',
            style: {
                fill: {
                    color: '#B2DFDB'
                },
            },
            position: {
                x: 6.9,
                y: 2.5,
            },
            size: {
                width: 3,
                height: 2.5,
            },
        },
        {
            type: 'text',
            content: '03',
            style: {
                fontSize: 36,
                fontColor: '#004D40',
                fontFamily: 'Arial',
                bold: true,
            },
            position: {
                x: 7.1,
                y: 2.7,
            },
            size: {
                width: 2.6,
                height: 0.6,
            },
        },
        {
            type: 'text',
            content: '量子数',
            style: {
                fontSize: 18,
                fontColor: '#00695C',
                fontFamily: 'Arial',
                bold: true,
            },
            position: {
                x: 7.1,
                y: 3.3,
            },
            size: {
                width: 2.6,
                height: 0.4,
            },
        },
        {
            type: 'text',
            content: '解决一维定态问题时，需要引入量子数来描述粒子的运动状态',
            style: {
                fontSize: 14,
                fontColor: '#00695C',
                fontFamily: 'Arial',
            },
            position: {
                x: 7.1,
                y: 3.7,
            },
            size: {
                width: 2.6,
                height: 1.2,
            },
        },
    ],
};

const gapConfig: any = {
    2: 0.4,
    3: 0.3,
    4: 0.2,
};

const marginConfig: any = {
    2: 20,
    3: 15,
    4: 10,
};

export default function render(data: ISlideItem, theme: Theme): Slide {
    const elements: SlideElement[] = [];
    // width :10
    const width = 13.3;
    const gap = gapConfig[data.list.length] || 0.4;
    const margin = marginConfig[data.list.length] || 10;
    const w = width - 1 - gap * (data.list.length - 1);
    const itemWidth = w / data.list.length;
    elements.push({
        type: 'title',
        content: data.title,
        style: {
            fontSize: titleFontSize,
            fontColor: theme.colors.primary,
            fontFamily: theme.fonts.title,
            bold: true,
            italic: false,
            underline: false,
        },
        position: {
            x: 0.5,
            y: 0.5,
        },
        size: {
            width: 11,
            height: 0.8,
        },
    });

    data.list.forEach((item, index) => {
        const x = 0.5 + index * (itemWidth + gap);
        const bgColor = theme.colors.complementary;
        const transparency = index % 2 == 0 ? 40 : 70;
        const fontColor = index % 2 == 0 ? '#FFFFFF' : theme.colors.text;

        elements.push(
            {
                type: 'shape',
                shapeName: 'roundRect',
                style: {
                    fill: {
                        color: bgColor,
                        transparency,
                    },
                    rectRadius: 0.1
                },
                position: {
                    x,
                    y: contentY,
                },
                size: {
                    width: itemWidth,
                    height: 4.5,
                },
            },
            {
                type: 'text',
                content: '0' + (index + 1),
                style: {
                    fontSize: 70,
                    fontColor: fontColor,
                    fontFamily: theme.fonts.body,
                    bold: true,
                    margin: [margin, margin, margin, margin]
                },
                position: {
                    x,
                    y: 2,
                },
                size: {
                    width: itemWidth,
                    height: 1,
                },
            },
            {
                type: 'text',
                content: item.title,
                style: {
                    fontSize: 18,
                    fontColor: fontColor,
                    fontFamily: theme.fonts.body,
                    bold: true,
                    margin: [margin, margin, margin, margin]
                },
                position: {
                    x,
                    y: 3.6,
                },
                size: {
                    width: itemWidth,
                    height: 0.4,
                },
            },
            {
                type: 'text',
                content: item.description,
                style: {
                    fontSize: 12,
                    fontColor: fontColor,
                    fontFamily: theme.fonts.body,
                    margin: [margin, margin, margin, margin]
                },
                position: {
                    x,
                    y: 4.1,
                },
                size: {
                    width: itemWidth,
                    height: 1.2,
                },
            }
        );
    });

    return {
        id: 'slide1',
        layout: 'CUSTOM',
        background: {
            color: theme.colors.background
        },
        elements,
    };
}