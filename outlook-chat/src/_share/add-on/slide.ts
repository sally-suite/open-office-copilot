import { ITableOption } from "chat-list/types/api/sheet";
import { ISlideItem } from "chat-list/types/api/slide";
import pptxgen from "pptxgenjs";
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
    // console.log(values)
    // await PowerPoint.run(async (context) => {
    //     const slide = context.presentation.getSelectedSlides().getItemAt(0);
    //     const shapes = context.presentation.getSelectedShapes();
    //     // context.presentation.slides.items[0].shapes.
    // })

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

    // const context = await PowerPoint.run(async (context) => context)
    // const range = context.presentation.getSelectedTextRange();

    // range.load(['text']);
    // await context.sync();
    // console.log(range.text)
    // return range.text;


}

export const getDocumentContent = async () => {
    return '';
}

export const registSelectEvent = async (callback: (text: string) => void) => {
    Office.context.document.addHandlerAsync(Office.EventType.DocumentSelectionChanged, function (eventArgs) {
        // 处理文档选择文本事件
        Office.context.document.getSelectedDataAsync(Office.CoercionType.Text, function (result: any) {
            if (result.status === Office.AsyncResultStatus.Succeeded) {
                // console.log("Selected text: " + result.value);
                callback(result.value);
            } else {
                console.error("Error getting selected text: " + result.error.message);
            }
        });
    });
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

export function generateSlide(title: string, subTitle: string, list: ISlideItem[]) {
    return;
}

export const createNewSlide = async () => {
    await PowerPoint.run(async function (context) {
        context.presentation.slides.add();
        await context.sync();
    })
}
export async function createPage(title: string, text: string, list?: string[], image?: { src: string, height: number, width: number }, notes?: string) {
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
    //     // context.presentation.slides.add();
    //     context.presentation.slides.load(['items'])
    //     await context.sync();

    //     const items = context.presentation.slides.items;
    //     console.log(items.length)
    //     const slide = items[items.length - 1]
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
    slide.addText(title, { placeholder: 'Title', x: 1, y: 1, w: 8, h: 0.5, fontSize: 36, fill: null, align: "left" });
    if (image) {
        slide.addImage({
            x: 5.8,
            y: 1.5,
            w: 4,
            h: 4,
            path: image.src
        })
    }
    let textWidth = 8;
    if (image) {
        textWidth = 5;
    }
    const texts: any = [];
    // if (list) {
    //     slide.addText(text + '\n\n' + list.join('\n'), { objectName: 'Title 1', placeholder: '1', x: 1, y: 2, w: textWidth, h: 0.5, fontSize: 20, bullet: false });
    // } else if (text) {
    //     slide.addText(text, { objectName: 'Content', placeholder: '1', x: 1, y: 2, w: textWidth, h: 0.5, fontSize: 20, bullet: false });
    // }
    if (text) {
        texts.push({
            text: text,
            options: {
                objectName: 'Content', placeholder: '1', w: textWidth, h: 1, fontSize: 20, bullet: false, fit: 'resize'
            }
        })
    }
    if (list && list.length > 0) {
        texts.push({
            text: list?.join('\n'),
            options: {
                objectName: 'Content', placeholder: '1', w: textWidth, h: 1, fontSize: 20, bullet: true, fit: 'resize'
            }
        })
    }
    slide.addText(texts, {
        x: 1, y: 2, w: textWidth, fontSize: 20, fit: 'resize', valign: 'top'
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


export function runScript(code: string) {
    eval(`(${code})()`);
}
