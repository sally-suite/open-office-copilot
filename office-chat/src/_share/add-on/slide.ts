import { ITableOption } from "chat-list/types/api/sheet";
import { ISlideItem, PptStructure, Presentation, Slide } from "chat-list/types/api/slide";
import { generatePPT, generateSlides } from 'chat-list/service/slide'
import pptxgen from "pptxgenjs";

const doc = {
    selectedSlides: [],
    selectedText: ''
}


export const insertText = async (text: string, options: {
    type?: 'text' | 'html' | 'title' | 'paragraph'
    position?: any
} = {
        type: 'html',
        position: ''
    }): Promise<void> => {

    // try {
    //     await PowerPoint.run(async (context) => {
    //         const slide = context.presentation.getSelectedSlides().getItemAt(0);
    //         const shapes = context.presentation.getSelectedShapes();
    //         shapes.load(['items'])
    //         await context.sync();
    //         const count = shapes.items.length;
    //         if (count > 0) {
    //             for (let i = 0; i < count; i++) {
    //                 const shape = shapes.getItemAt(i);
    //                 shape.textFrame.textRange.text = text;
    //             }
    //             await context.sync();
    //             return;
    //         }
    //         const textBox = slide.shapes.addTextBox(text);
    //         textBox.fill.setSolidColor("white");
    //         textBox.lineFormat.color = "black";
    //         textBox.lineFormat.weight = 1;
    //         textBox.lineFormat.dashStyle = PowerPoint.ShapeLineDashStyle.solid;
    //         await context.sync();
    //     });
    // } catch (error) {
    //     console.log("Error: " + error);
    // }
    // const type = options.type;
    return new Promise((resolve, reject) => {
        Office.context.document.setSelectedDataAsync(
            text,
            {
                coercionType: Office.CoercionType.Text
            },
            (asyncResult) => {
                if (asyncResult.status === Office.AsyncResultStatus.Succeeded) {
                    resolve(null);
                } else {
                    reject(asyncResult.error);
                }
            }
        );
    })

}

// 插入一个段落
// export const insertParagraph = async (text: string, position: Word.InsertLocation = Word.InsertLocation.after): Promise<void> => {
//     const context = await Word.run(async (context) => context);
//     const selection = context.document.getSelection();
//     const paragraph = selection.insertParagraph(text, position);
//     paragraph.font.bold = false;
//     return context.sync();
// }

// export const insertImage = async (base64: string, width?: number, height?: number, altTitle?: string, altDescription?: string) => {
//     return await PowerPoint.run(async function (context) {
//         // 获取当前选定的范围
//         const slide = context.presentation.getSelectedSlides().getItemAt(0);

//         // 在选定范围中插入图片
//         const img = base64.split(',')[1];
//         const picture = range.insertInlinePictureFromBase64(img, Word.InsertLocation.replace);
//         picture.load(['altTextTitle', 'altTextDescription']);
//         await context.sync();
//         picture.altTextTitle = altTitle;
//         picture.altTextDescription = altDescription;
//         picture.width = width;
//         picture.height = height;

//         await context.sync();
//         return;
//     });
// }

export async function insertImage(base64Image: string) {
    // Call Office.js to insert the image into the document.
    // console.log(base64Image)
    // 获取base64编码的内容

    const base64 = base64Image.split(',')[1];
    return new Promise((resolve, reject) => {
        Office.context.document.setSelectedDataAsync(
            base64,
            {
                coercionType: Office.CoercionType.Image
            },
            (asyncResult) => {
                if (asyncResult.status === Office.AsyncResultStatus.Succeeded) {
                    resolve(null);
                } else {
                    reject(asyncResult.error);
                }
            }
        );
    })

}

export const insertTable = async (values: string[][], options: ITableOption) => {
    const {
        headerRowColor = '#80cf9c',
        headerFontColor = '#000000',
        firstRowColor = '#ffffff',
        secondRowColor = '#eaf8f0',
        footerRowColor = '#bbe7cc',
        borderColor = '#EDEDED',
        rowFontColor = '#000000',
        theme = 'LIGHT_GREY',
    } = options;
    // Office.context.document.setSelectedDataAsync(
    //     text,
    //     {
    //         coercionType: Office.CoercionType.Html,

    //     },
    //     (asyncResult) => {
    //         if (asyncResult.status === Office.AsyncResultStatus.Succeeded) {
    //             resolve(null);
    //         } else {
    //             reject(asyncResult.error);
    //         }
    //     }
    // );

}

export const getSelectedText = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
        Office.context.document.getSelectedDataAsync(Office.CoercionType.Text, (asyncResult) => {
            if (asyncResult.status === Office.AsyncResultStatus.Succeeded) {
                resolve(asyncResult.value as string)
                return asyncResult.value;
            } else {
                resolve('');
                // reject(asyncResult.error);
            }
        })
    })
}

export const getDocumentContent = async () => {
    return '';
}

export const registSelectEvent = (callback: (text: string) => void) => {
    const handler = () => {
        if (callback) {
            callback('');
        }
    }
    Office.context.document.addHandlerAsync(Office.EventType.DocumentSelectionChanged, handler);

    // Office.context.document.addHandlerAsync(Office.EventType.DocumentSelectionChanged, async function (eventArgs) {
    //     // 处理文档选择文本事件
    //     // console.log(eventArgs)
    //     // const slides = await getSelectedSlides();
    //     // console.log(slides)
    //     // doc.selectedSlides = slides;
    //     // Office.context.document.getSelectedDataAsync(Office.CoercionType.Text, function (result: any) {
    //     //     if (result.status === Office.AsyncResultStatus.Succeeded) {
    //     //         // console.log("Selected text: " + result.value);
    //     //         // console.log(result.value)
    //     //         doc.selectedText = result.value;
    //     //         console.log(doc)
    //     //         callback(result.value);
    //     //     } else {
    //     //         console.error("Error getting selected text: " + result.error.message);
    //     //     }
    //     // });
    //     if (callback) {
    //         callback('');
    //     }
    // });
    return () => {
        return Office.context.document.removeHandlerAsync(Office.EventType.DocumentSelectionChanged, {
            handler: handler
        });
    }
}

export const getSelectedImageInfo = (): Promise<{ title: string, description: string }> => {
    // return PowerPoint.run(async (context) => {
    //     const range = context.presentation.getSelectedShapes();
    //     await context.sync();

    //     const images = range.inlinePictures;
    //     await context.load(images);

    //     await context.sync();
    //     if (images.items.length > 0) {
    //         const image = images.items[0];
    //         image.load(['altTextTitle', 'altTextDescription']);
    //         await context.sync();
    //         return {
    //             title: image.altTextTitle,
    //             description: image.altTextDescription
    //         }
    //     }
    //     return null;
    // });

    // return new Promise((resolve, reject) => {
    //     Office.context.document.getSelectedDataAsync(Office.CoercionType.Image,
    //         (asyncResult) => {
    //             if (asyncResult.status === Office.AsyncResultStatus.Succeeded) {
    //                 console.log(asyncResult.value)
    //                 resolve(null);
    //             } else {
    //                 reject(asyncResult.error);
    //             }
    //         }
    //     );
    // })
    return null;
}

export async function generateSlide(elements: Slide[]) {

    const result = await generateSlides(elements);

    await PowerPoint.run(async function (context) {

        context.presentation.slides.load(['items'])
        await context.sync();

        const items = context.presentation.slides.items;
        console.log(items.length)
        let targetSlideId;
        if (items.length > 0) {
            const slide = items[items.length - 1]
            targetSlideId = slide.id;
        }

        context.presentation.insertSlidesFromBase64(result, {
            formatting: 'UseDestinationTheme',
            targetSlideId: targetSlideId
        });
        await context.sync();
    })
}


export const createNewSlide = async () => {
    await PowerPoint.run(async function (context) {
        context.presentation.slides.add();
        await context.sync();
    })
}

let slideCount = 0;
export async function createPage(title: string, text: string, list?: string[], image?: { src: string, height?: number, width?: number }, notes?: string) {
    // PowerPoint.run(async (context) => {
    //     // 新建一个演示文稿
    //     const presentation = context.presentation;

    //     // 指定要使用的布局
    //     const layout = PowerPoint.PresentationLayoutType.Title;
    //     // 在演示文稿中插入一张幻灯片，并指定布局
    //     const slide = presentation.slides.add(layout);

    //     // 在幻灯片中添加一些内容（示例：标题和文本框）
    //     slide.title = 'Hello PowerPoint!';
    //     slide.addText('This is a new slide created with PowerPoint JavaScript API.');

    //     // 执行 PowerPoint API 操作
    //     await context.sync();

    //     // 在当前 PowerPoint 中显示新创建的演示文稿
    //     presentation.presentation.show();
    // })
    //     .catch(error => {
    //         console.log(`Error: ${error}`);
    //         if (error instanceof OfficeExtension.Error) {
    //             console.log(`Debug info: ${JSON.stringify(error.debugInfo)}`);
    //         }
    //     });
    // await createNewSlide();
    // await PowerPoint.run(async function (context) {

    //     // const shapes = context.presentation.slides.getItemAt(0).shapes;

    //     // context.presentation.slides.load(['items'])
    //     // await context.sync();
    //     // console.log(context.presentation.slides.items.length)
    //     context.presentation.slides.add();
    //     context.presentation.slides.load(['items'])
    //     await context.sync();

    //     const items = context.presentation.slides.items;
    //     console.log(items.length)
    //     const slide = items[items.length - 1]
    //     slide.shapes.addGeometricShape()
    //     slide.layout.load({
    //         $all: true,
    //     })
    //     await context.sync();

    //     console.log(slide.layout.name)
    //     console.log(slide.layout.id)
    //     console.log(slide.id)
    //     // context.presentation.setSelectedSlides([])
    //     // context.presentation.
    //     // // slide.title.text = title;
    //     slide.shapes.load(['items'])
    //     await context.sync();
    //     // for (let i = 0; i < slide.shapes.items.length; i++) {
    //     //     const element = slide.shapes.items[i];
    //     //     // element.load('name')
    //     //     // await context.sync();
    //     //     console.log(element.name)
    //     //     // console.log(element)
    //     //     // element.textFrame.textRange.text = '1111'
    //     //     // console.log(element.name)

    //     // }
    //     // await context.sync();

    //     const element = slide.shapes.getItem()
    //     element.load(['name'])
    //     await context.sync();
    //     console.log(element.name)

    // });
    // return;
    let pptx = new pptxgen();

    let slide = pptx.addSlide({
        sectionTitle: title
    });
    let textWidth: any = 8;
    let isLeft;
    try {
        if (image && image.src) {
            if (slideCount++ % 2 == 0) {
                isLeft = true;
                slide.addImage({
                    x: 0,
                    y: 0,
                    w: '38%',
                    h: '100%',
                    path: image.src
                })
            } else {
                isLeft = false;
                slide.addImage({
                    x: '62%',
                    y: 0,
                    w: '38%',
                    h: '100%',
                    path: image.src,
                })
            }
        }
        if (image && image.src) {
            textWidth = '62%';
        }
    } catch (e) { }


    // if (slideCount++ % 2 == 0) {
    //     isLeft = true;

    //     slide.addShape('rect', {
    //         x: 0,
    //         y: 0,
    //         w: '38%',
    //         h: '100%',
    //         fill: {
    //             color: '000000'
    //         }
    //     })
    // } else {
    //     isLeft = false;

    //     slide.addShape('rect', {
    //         x: '62%',
    //         y: 0,
    //         w: '38%',
    //         h: '100%',
    //         fill: {
    //             color: '000000'
    //         }
    //     })
    // }

    // textWidth = '62%';

    const texts: any = [];
    // if (list) {
    //     slide.addText(text + '\n\n' + list.join('\n'), { objectName: 'Title 1', placeholder: '1', x: 1, y: 2, w: textWidth, h: 0.5, fontSize: 20, bullet: false });
    // } else if (text) {
    //     slide.addText(text, { objectName: 'Content', placeholder: '1', x: 1, y: 2, w: textWidth, h: 0.5, fontSize: 20, bullet: false });
    // }
    let x: any;
    if (isLeft) {
        x = '38%';
    } else {
        x = 0;
    }

    slide.addText(title, { placeholder: 'Title', x, y: 1, w: textWidth, h: 0.5, fontSize: 36, fill: null, align: "left" });

    if (text) {
        texts.push({
            text: text,
            options: {
                objectName: 'Content', placeholder: '1',
                // w: textWidth,
                h: 1,
                fontSize: 20, bullet: false, fit: 'resize'
            }
        })
    }
    if (list && list.length > 0) {
        texts.push({
            text: list?.join('\n'),
            options: {
                objectName: 'Content',
                placeholder: '1',
                // w: textWidth,
                h: 1,
                fontSize: 20, bullet: true, fit: 'resize'
            }
        })
    }

    slide.addText(texts, {
        x, y: 1, w: textWidth, fontSize: 20, h: '60%', fit: 'resize', valign: 'middle'
    });



    if (notes) {
        slide.addNotes(notes);
    }
    // pptx.writeFile({ fileName: "react-demo.pptx" });
    const result = await pptx.write({
        outputType: 'base64'
    }) as string;

    await PowerPoint.run(async function (context) {
        // context.presentation.slides.load(['items'])
        // await context.sync();
        // console.log(context.presentation.slides.items.length)
        // context.presentation.slides.add();
        context.presentation.slides.load(['items'])
        await context.sync();

        const items = context.presentation.slides.items;
        console.log(items.length)
        const slide = items[items.length - 1]
        context.presentation.insertSlidesFromBase64(result, {
            formatting: 'UseDestinationTheme',
            targetSlideId: slide.id
        });
        await context.sync();
    })
}

export async function createCover(title: string, subTitle: string) {
    let pptx = new pptxgen();

    let slide = pptx.addSlide({
        sectionTitle: title
    });

    slide.addText(title, { placeholder: 'Title', x: 1, y: 2, w: 8, h: 0.5, fontSize: 56, fill: null, align: "center" });

    slide.addText(subTitle, { placeholder: 'Sub Title', x: 1, y: 3, w: 8, h: 0.5, fontSize: 28, fill: null, align: "center" });

    // pptx.writeFile({ fileName: "react-demo.pptx" });
    const result = await pptx.write({
        outputType: 'base64'
    }) as string;

    await PowerPoint.run(async function (context) {
        // context.presentation.slides.load(['items'])
        // await context.sync();
        // console.log(context.presentation.slides.items.length)
        // context.presentation.slides.add();
        // context.presentation.slides.load(['items'])
        // await context.sync();

        // const items = context.presentation.slides.items;
        // console.log(items.length)
        // const slide = items[items.length - 1]
        context.presentation.insertSlidesFromBase64(result, {
            formatting: 'UseDestinationTheme'
        });
        await context.sync();
    })
}

export async function createEnd(endText: string) {

}
export function deselect() {
    // doc.selectedText = '';
}

export function runScript(code: string) {
    return eval(`(${code})()`);
}

export const getSelectedSlides = async (): Promise<{ id: string, num: number, texts: string[] }[]> => {
    return await PowerPoint.run(async context => {
        const presentation = context.presentation;
        let allSlides = presentation.slides;
        allSlides.load(["items"]);
        await context.sync();
        let allItems = allSlides.items;
        let ids = allItems.map(item => item.id);
        const slides = presentation.getSelectedSlides();
        slides.load(["items"]);
        await context.sync();

        const allTexts: { id: string, num: number, texts: string[] }[] = [];
        slides.load("items");
        await context.sync();
        for (let i = 0; i < slides.items.length; i++) {
            const slide = slides.items[i]
            const id = slide.id;
            // const slide = slides.getItem(id);
            slide.load(["shapes", 'textFrame', 'textRange']);
            await context.sync();
            const texts = [];
            slide.shapes.load('items')
            await context.sync();
            for (let i = 0; i < slide.shapes.items.length; i++) {

                const shape = slide.shapes.items[i];
                if (shape.type !== PowerPoint.ShapeType.geometricShape) {
                    continue;
                }
                try {
                    shape.textFrame.textRange.load('text')
                    await context.sync();
                    const text = shape.textFrame.textRange.text;
                    texts.push(text);
                } catch (e) {
                    continue;
                }

            }

            const num = ids.indexOf(id) + 1;
            allTexts.push({
                num,
                id,
                texts
            });
        }
        // return slides.items;
        return allTexts;
    });
}

export const getSlides = async (isSelected: boolean = false) => {
    return await PowerPoint.run(async context => {
        const presentation = context.presentation;
        // let slides = presentation.slides.
        if (isSelected) {
            const slides = presentation.getSelectedSlides();
            slides.load(["items"]);
            await context.sync();
            return slides.items.map((item) => {
                return {
                    id: item.id
                }
            })
        } else {
            const slides = presentation.slides;
            slides.load(["items"]);
            await context.sync();
            return slides.items.map((item) => {
                return {
                    id: item.id
                }
            })
        }
        // return slides.items;
    });
}

export async function getSlidesText(id?: string): Promise<{ id: string, texts: string[] }[]> {
    return await PowerPoint.run(async context => {
        const presentation = context.presentation;
        const slides = presentation.slides;

        slides.load(["items", 'shapes', 'textFrame', 'textRange']);

        await context.sync();
        if (id) {
            const slide = slides.getItem(id);
            slide.load(["shapes", 'textFrame', 'textRange']);
            await context.sync();
            const texts = [];
            for (let i = 0; i < slide.shapes.items.length; i++) {
                const shape = slide.shapes.items[i];
                if (shape.type !== PowerPoint.ShapeType.geometricShape) {
                    continue;
                }
                try {
                    shape.textFrame.textRange.load('text')
                    await context.sync();
                    const text = shape.textFrame.textRange.text;
                    texts.push(text);
                } catch (e) {
                    continue;
                }

            }
            return [{
                id,
                texts
            }];
        }

        const allTexts: { id: string, texts: string[] }[] = [];

        for (let i = 0; i < slides.items.length; i++) {
            const slide = slides.items[i];
            const texts = [];
            const id = slide.id;
            for (let j = 0; j < slide.shapes.items.length; j++) {
                const shape = slide.shapes.items[j];
                if (shape.type !== PowerPoint.ShapeType.geometricShape) {
                    continue;
                }
                try {
                    shape.textFrame.textRange.load('text')
                    await context.sync();
                    const text = shape.textFrame.textRange.text;
                    texts.push(text);
                } catch (e) {
                    continue;
                }

            }
            allTexts.push({
                id,
                texts
            })
        }
        console.log(allTexts)
        return allTexts;
    });
}
export const setSpeakerNote = async (id: string) => {
    return;
}

export async function insertSlidesFromBase64(base64: string) {
    await PowerPoint.run(async function (context) {
        context.presentation.insertSlidesFromBase64(base64, {
            formatting: 'UseDestinationTheme'
        });
        await context.sync();
    })
}


export const openDialog = async (fullUrl: string, options: any = {}, callback?: (result: any) => void): Promise<void> => {
    const { height = 60, width = 30 } = options;
    let loginDialog: Office.Dialog;
    Office.context.ui.displayDialogAsync(fullUrl, { height, width }, function (result) {
        console.log("Dialog has initialized. Wiring up events");
        loginDialog = result.value;
        loginDialog.addEventHandler(Office.EventType.DialogMessageReceived, (event: {
            message: string;
            origin: string;
        }) => {

            loginDialog.close();
            if (callback) {
                callback(event.message);
            }
        });
    });
}



export const generatePresentation = async (presentation: Presentation) => {

    const result = await generatePPT(presentation);

    await PowerPoint.run(async function (context) {
        // context.presentation.slides.load(['items'])
        // await context.sync();
        // console.log(context.presentation.slides.items.length)
        // context.presentation.slides.add();
        context.presentation.slides.load(['items'])
        await context.sync();

        const items = context.presentation.slides.items;
        let targetSlideId = '';
        if (items.length > 0) {
            const slide = items[items.length - 1]
            targetSlideId = slide.id;
        }
        context.presentation.insertSlidesFromBase64(result, {
            formatting: 'UseDestinationTheme',
            targetSlideId: targetSlideId
        });
        await context.sync();
    })
}