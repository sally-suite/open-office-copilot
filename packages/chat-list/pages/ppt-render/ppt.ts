
import { Presentation } from 'chat-list/types/api/slide';
import pptxgen from 'pptxgenjs'

export function generatePPT(pptStructure: Presentation) {
    const pres = new pptxgen();
    pres.layout = 'LAYOUT_WIDE';
    // 设置元数据
    pres.title = pptStructure.metadata.title;
    pres.subject = pptStructure.metadata.subject;
    pres.author = pptStructure.metadata.author;
    pres.company = pptStructure.metadata.company;

    // 设置主题
    pres.theme = {
        headFontFace: pptStructure.theme.fonts.title,
        bodyFontFace: pptStructure.theme.fonts.body,
        // colors: {
        //     accent1: pptStructure.theme.colors.primary,
        //     accent2: pptStructure.theme.colors.secondary
        // }
    };

    // 遍历每个幻灯片
    pptStructure.slides.forEach(slideData => {
        const slide = pres.addSlide({ masterName: slideData.layout });

        // 设置背景
        if (slideData.background.color) {
            slide.background = { color: slideData.background.color };
        }
        if (slideData.background.image) {
            slide.background = { path: slideData.background.image };
        }

        // 添加元素
        slideData.elements.forEach((element) => {
            switch (element.type) {
                case 'title':
                case 'text':
                    if (Array.isArray(element.content)) {
                        const textBlocks = element.content.map((block, index) => {
                            return {
                                text: block.text + '\n',
                                options: {
                                    fontSize: block.style.fontSize,
                                    color: block.style.fontColor,
                                    fontFace: block.style.fontFamily,
                                    placeholder: 'Title',
                                    paraSpaceAfter: block.style.spaceAfter || 0,
                                    paraSpaceBefore: block.style.spaceBefore || 0,
                                    lineSpacing: block.style.lineSpacing,
                                }
                            }
                        })
                        slide.addText(textBlocks, {
                            shape: element.shapeName || 'rect',
                            placeholder: element.placeholder || 'Title',
                            x: element.position.x,
                            y: element.position.y,
                            w: element.size.width,
                            h: element.size.height,
                            fontSize: element.style.fontSize,
                            color: element.style.fontColor,
                            fontFace: element.style.fontFamily,
                            bold: element.style.bold,
                            italic: element.style.italic,
                            // underline: element.style.underline,
                            bullet: element.style.bullet ? { type: 'number' } : false,
                            valign: element.style.valign || 'top',
                            align: element.style.align || 'left',
                            fill: element.style.fill || null,
                            margin: element.style.margin || null,
                            rectRadius: element.style.rectRadius || 0,
                        });
                    } else {
                        slide.addText(element.content, {
                            shape: element.shapeName || 'rect',
                            rectRadius: element.style.rectRadius || 0,
                            placeholder: element.placeholder || 'Title',
                            x: element.position.x,
                            y: element.position.y,
                            w: element.size.width,
                            h: element.size.height,
                            fontSize: element.style.fontSize,
                            color: element.style.fontColor,
                            fontFace: element.style.fontFamily,
                            bold: element.style.bold,
                            italic: element.style.italic,
                            lineSpacing: element.style.lineSpacing,
                            // underline: element.style.underline,
                            bullet: element.style.bullet,
                            valign: element.style.valign || 'top',
                            align: element.style.align || 'left',
                            paraSpaceAfter: element.style.spaceAfter || 0,
                            paraSpaceBefore: element.style.spaceBefore || 0,
                            fill: element.style.fill || null,
                            margin: element.style.margin || null,
                        });
                    }

                    break;

                case 'image':
                    slide.addImage({

                        path: element.src,
                        x: element.position.x,
                        y: element.position.y,
                        w: element.size.width,
                        h: element.size.height
                    });
                    break;
                case 'shape':

                    slide.addShape(element.shapeName as any, {
                        x: element.position.x,
                        y: element.position.y,
                        w: element.size.width,
                        h: element.size.height,
                        fill: {
                            color: element.style?.fill?.color || '#FFFFFF',
                            transparency: element.style?.fill?.transparency || 0,
                        },
                        rectRadius: element.style.rectRadius || 0,
                    })
                    break;

                case 'chart':
                    slide.addChart(
                        pptxgen.charts[element.chartType],
                        element.data,
                        {
                            x: element.position.x,
                            y: element.position.y,
                            w: element.size.width,
                            h: element.size.height
                        }
                    );
                    break;
            }
        });
    });

    // 保存PPT
    pres.writeFile({ fileName: pptStructure.metadata.title + ".pptx" });
}