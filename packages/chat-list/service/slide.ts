/* eslint-disable prefer-const */
import { Presentation, Slide } from 'chat-list/types/api/slide';
import pptxgen from 'pptxgenjs';

export async function generatePPT(data: Presentation): Promise<string> {
    const pptStructure = JSON.parse(JSON.stringify(data));
    const pres = new pptxgen();
    pres.layout = 'LAYOUT_WIDE';
    // 设置元数据
    pres.title = pptStructure.metadata.title;
    pres.subject = pptStructure.metadata.subject;
    pres.author = pptStructure.metadata.author;
    // pres.company = pptStructure.metadata.company;

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
                                    color: block.style.color,
                                    fontFace: block.style.fontFamily,
                                    placeholder: 'Title',
                                    paraSpaceAfter: block.style.spaceAfter || 0,
                                    paraSpaceBefore: block.style.spaceBefore || 0,
                                    lineSpacing: block.style.lineSpacing,
                                    fill: block.style.fill || null,
                                }
                            };
                        });
                        slide.addText(textBlocks, {
                            shape: element.shapeName || 'rect',
                            placeholder: element.placeholder || 'Title',
                            x: element.position.x,
                            y: element.position.y,
                            w: element.size.width,
                            h: element.size.height,
                            fontSize: element.style.fontSize,
                            color: element.style.color,
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
                            fit: element.type == 'text' ? 'shrink' : 'none'
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
                            color: element.style.color,
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
                            fit: element.type == 'text' ? 'shrink' : 'none'
                        });
                    }

                    break;

                case 'image':
                    slide.addImage({
                        // rounding: true,
                        path: element.src,
                        x: element.position.x,
                        y: element.position.y,
                        w: element.size.width,
                        h: element.size.height,
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
                        // shadow: {
                        //     type: 'outer',
                        //     opacity: 0.4,
                        //     angle: 45,
                        //     offset: 3,
                        //     color: '000000',
                        //     blur: 4
                        // }
                    });
                    break;
                case 'table':
                    // eslint-disable-next-line no-case-declarations
                    // const tableBgcolor = element.style.fill?.color.replace('#', '');
                    // eslint-disable-next-line no-case-declarations
                    const { rows, options } = element.table;

                    slide.addTable(rows, {
                        x: element.position.x,
                        y: element.position.y,
                        w: element.size.width,
                        h: element.size.height,
                        border: options.border,
                        fill: {
                            color: element.style.fill.color
                        },
                        fontSize: 16,
                        color: element.style.color,
                    });
                    break;
                case 'chart':
                    // const theme = pptStructure.theme;
                    // eslint-disable-next-line no-case-declarations
                    const bgcolor = element.style.fill?.color.replace('#', '');
                    console.log(bgcolor);
                    // eslint-disable-next-line no-case-declarations
                    const title = element.data[0].name;
                    slide.addChart(element.chartType as any,
                        element.data,
                        {
                            title,
                            x: element.position.x,
                            y: element.position.y,
                            w: element.size.width,
                            h: element.size.height,
                            // showValue: true,
                            color: element.style.color,
                            titleColor: element.style.color,
                            legendColor: element.style.color,
                            catAxisLabelColor: element.style.color,
                            valAxisLabelColor: element.style.color,
                            dataLabelColor: element.style.color,
                            valAxisTitleColor: element.style.color,
                            chartArea: {
                                fill: {
                                    color: bgcolor,
                                },
                                roundedCorners: true
                            },
                            showLegend: true,
                            showTitle: true,
                            // showLabel: true,
                            showPercent: true,
                            legendFontSize: 16,
                            titleBold: true,
                            titleFontSize: 20,
                            fontSize: 16,
                            valAxisLabelFontSize: 16,
                            dataLabelFontSize: 16,

                            // catAxisLabelColor: bgcolor,
                            // catAxisLabelFontFace: "Helvetica Neue",
                            // catAxisLabelFontSize: 14,
                            // catGridLine: { style: "none" },
                            // catAxisHidden: true,

                            valGridLine: { color: bgcolor, style: "dash", size: 1 },
                            valAxisLineColor: bgcolor,
                            valAxisLineSize: 1,
                            valAxisLineStyle: "dash",
                            shadow: {
                                type: 'outer',
                                angle: 45,
                                blur: 5,
                                color: '000000',
                                offset: 5,
                                opacity: 0.5
                            }

                        }
                    );
                    break;
            }
        });

        slide.addNotes(slideData.notes);

    });

    // 保存PPT
    pres.writeFile({
        fileName: pptStructure.metadata.title + ".pptx"
    });

    const result = await pres.write({
        outputType: 'base64'
    });

    return result as string;

    // const result = await pres.write({
    //     outputType: 'blob'
    // })

    // return result as string;
}

export async function generateSlides(slides: Slide[]) {
    const pres = new pptxgen();
    pres.layout = 'LAYOUT_WIDE';


    // 遍历每个幻灯片
    slides.forEach(slideData => {
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
                                    color: block.style.color,
                                    fontFace: block.style.fontFamily,
                                    placeholder: 'Title',
                                    paraSpaceAfter: block.style.spaceAfter || 0,
                                    paraSpaceBefore: block.style.spaceBefore || 0,
                                    lineSpacing: block.style.lineSpacing,
                                    fill: block.style.fill || null,
                                }
                            };
                        });
                        slide.addText(textBlocks, {
                            shape: element.shapeName || 'rect',
                            placeholder: element.placeholder || 'Title',
                            x: element.position.x,
                            y: element.position.y,
                            w: element.size.width,
                            h: element.size.height,
                            fontSize: element.style.fontSize,
                            color: element.style.color,
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
                            fit: element.type == 'text' ? 'shrink' : 'none'
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
                            color: element.style.color,
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
                            fit: element.type == 'text' ? 'shrink' : 'none'
                        });
                    }

                    break;

                case 'image':
                    slide.addImage({
                        // rounding: true,
                        path: element.src,
                        x: element.position.x,
                        y: element.position.y,
                        w: element.size.width,
                        h: element.size.height,
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
                    });
                    break;
                case 'table':
                    // eslint-disable-next-line no-case-declarations
                    // const tableBgcolor = element.style.fill?.color.replace('#', '');
                    // eslint-disable-next-line no-case-declarations
                    const { rows, options } = element.table;

                    slide.addTable(rows, {
                        x: element.position.x,
                        y: element.position.y,
                        w: element.size.width,
                        h: element.size.height,
                        border: options.border,
                        // fill: {
                        //     color: tableBgcolor,
                        //     transparency: 95
                        // },
                        fontSize: 16,
                        color: element.style.color,
                    });
                    break;
                case 'chart':
                    // const theme = pptStructure.theme;
                    // eslint-disable-next-line no-case-declarations
                    const bgcolor = element.style.fill?.color.replace('#', '');
                    console.log(bgcolor);
                    // eslint-disable-next-line no-case-declarations
                    const tittleEle = slideData.elements.find(p => p.type == 'title');
                    slide.addChart(element.chartType as any,
                        element.data,
                        {
                            title: tittleEle.content as string,
                            x: element.position.x,
                            y: element.position.y,
                            w: element.size.width,
                            h: element.size.height,
                            // showValue: true,
                            chartArea: {
                                fill: {
                                    color: bgcolor,
                                    transparency: element.style?.fill?.transparency || 90
                                },
                                roundedCorners: true
                            },
                            showLegend: true,
                            showTitle: true,
                            // showLabel: true,
                            showPercent: true,
                            legendFontSize: 20,
                            titleBold: true,
                            titleFontSize: 30,
                            fontSize: 30,
                            valAxisLabelFontSize: 20,
                            dataLabelFontSize: 20,

                            // catAxisLabelColor: bgcolor,
                            // catAxisLabelFontFace: "Helvetica Neue",
                            // catAxisLabelFontSize: 14,
                            // catGridLine: { style: "none" },
                            // catAxisHidden: true,

                            valGridLine: { color: bgcolor, style: "dash", size: 1 },
                            valAxisLineColor: bgcolor,
                            valAxisLineSize: 1,
                            valAxisLineStyle: "dash",
                            shadow: {
                                type: 'outer',
                                angle: 45,
                                blur: 5,
                                color: '000000',
                                offset: 5,
                                opacity: 0.5
                            }

                        }
                    );
                    break;
            }
        });

        slide.addNotes(slideData.notes);

    });

    // 保存PPT
    pres.writeFile({
        fileName: "slide.pptx"
    });

    const result = await pres.write({
        outputType: 'base64'
    });

    return result as string;
}
