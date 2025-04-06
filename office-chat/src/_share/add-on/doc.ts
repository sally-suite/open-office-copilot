import { ITableOption } from "chat-list/types/api/sheet";
import { pixelsToPoints } from './utils';
// import MarkdownToWord from './mark-word'
import { insertMarkdown, insertFootnoteToDoc } from './mark-katex'
import { Footnote } from "chat-list/types/api/doc";
import { runCode } from "./code";

const doc = {
    selectedText: ''
}
let i = 0;
export const insertText = async (text: string, options: {
    type?: 'text' | 'html' | 'title' | 'paragraph' | 'markdown'
    position?: Word.InsertLocation
} = {
        type: 'text',
        position: Word.InsertLocation.after
    }): Promise<void> => {
    const { type = 'html', position = Word.InsertLocation.after } = options;
    console.log(text)
    if (type == 'html') {
        return new Promise((resolve, reject) => {
            Office.context.document.setSelectedDataAsync(
                text,
                {
                    coercionType: type == 'html' ? Office.CoercionType.Html : Office.CoercionType.Text,

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
    } else {
        await insertMarkdown(text)
    }

    // return await Word.run(async function (context) {
    //     // 获取当前选定的范围
    //     var range = context.document.getSelection();
    //     // 在选定范围中插入文本
    //     const instance = new MarkdownToWord();
    //     console.log('text', text)
    //     instance.insertMarkdown(text);
    //     return context.sync();
    // });
}



// 插入一个段落
// export const insertParagraph = async (text: string, position: Word.InsertLocation = Word.InsertLocation.after): Promise<void> => {
//     const context = await Word.run(async (context) => context);
//     const selection = context.document.getSelection();
//     const paragraph = selection.insertParagraph(text, position);
//     paragraph.font.bold = false;
//     return context.sync();
// }

export const insertFootnote = async (footnote: Footnote) => {
    return await Word.run(async function (context) {
        // 获取当前选定的范围
        var range = context.document.getSelection();
        // 在选定范围中插入文本
        await insertFootnoteToDoc(footnote, range)
        return context.sync();
    });
}

export const insertImage = async (base64: string, width?: number, height?: number, altTitle?: string, altDescription?: string, insertLocation = Word.InsertLocation.after) => {
    return await Word.run(async function (context) {
        // 根据指定的位置获取范围
        var range;
        if (insertLocation === Word.InsertLocation.end) {
            // 获取文档的末尾位置
            console.log('end')
            range = context.document.body.getRange(Word.InsertLocation.end);
        } else {
            // 获取当前选定的范围
            range = context.document.getSelection();
        }
        // 在指定范围中插入图片
        const img = base64.split(',')[1];
        const picture = range.insertInlinePictureFromBase64(img, insertLocation);
        picture.load(['altTextTitle', 'altTextDescription', 'width', 'height']);
        await context.sync();
        picture.altTextTitle = altTitle;
        picture.altTextDescription = altDescription;
        if (width && height) {
            picture.width = Math.round(pixelsToPoints(width));
            picture.height = Math.round(pixelsToPoints(height));
        }

        // if (height) picture.height = height;

        // picture.insertParagraph("", Word.InsertLocation.before).alignment = Word.Alignment.centered;
        // picture.paragraph.alignment = Word.Alignment.mixed;

        await context.sync();
        return;
    });
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
    const context = await Word.run(async (context) => context);
    // 获取当前文档的内容
    var body = context.document.getSelection();

    // 插入一个新的表格
    var table = body.insertTable(values.length, values[0].length, Word.InsertLocation.after, values);

    table.getBorder(Word.BorderLocation.all).color = borderColor;

    for (let i = 0; i < values.length; i++) {
        if (i == 0) {
            for (let j = 0; j < values[i].length; j++) {
                let cell = table.getCell(i, j);
                cell.parentRow.font.color = headerFontColor;
                cell.parentRow.font.bold = true;
                cell.shadingColor = headerRowColor;
                cell.parentRow.setCellPadding(Word.CellPaddingLocation.top, 5);
                cell.parentRow.setCellPadding(Word.CellPaddingLocation.bottom, 5);
                cell.parentRow.setCellPadding(Word.CellPaddingLocation.left, 5);
                cell.parentRow.setCellPadding(Word.CellPaddingLocation.right, 5);
            }
            continue
        }
        for (let j = 0; j < values[i].length; j++) {
            let cell = table.getCell(i, j);
            cell.parentRow.font.color = rowFontColor;
            cell.parentRow.font.bold = false;
            cell.parentRow.setCellPadding(Word.CellPaddingLocation.top, 5);
            cell.parentRow.setCellPadding(Word.CellPaddingLocation.bottom, 5);
            cell.parentRow.setCellPadding(Word.CellPaddingLocation.left, 5);
            cell.parentRow.setCellPadding(Word.CellPaddingLocation.right, 5);
            if (i % 2 == 0) {
                cell.shadingColor = secondRowColor;
            } else {
                cell.shadingColor = firstRowColor;
            }
        }
    }
    // 执行 Word 操作
    return context.sync();

}

export const getSelectedText = async (): Promise<string> => {

    if (doc.selectedText) {
        return doc.selectedText;
    }

    const context = await Word.run(async (context) => context)
    var selection = context.document.getSelection();
    selection.load(['isEmpty', 'text'])
    await context.sync()
    if (selection.isEmpty) {
        return "";
    } else {
        return selection.text;
    }
}

export const getDocumentContent = async () => {
    return Word.run(async (context) => {
        const body = context.document.body;
        body.load(['text', 'styleBuiltIn']);
        await context.sync();
        return body.text;
    })
}

export const registSelectEvent = (callback: (text: string) => void) => {
    const handler = () => {
        // 处理文档选择文本事件
        Office.context.document.getSelectedDataAsync(Office.CoercionType.Text, function (result: any) {
            if (result.status === Office.AsyncResultStatus.Succeeded) {
                // console.log("Selected text: " + result.value);
                doc.selectedText = result.value;
                callback(result.value);
            } else {
                console.error("Error getting selected text: " + result.error.message);
            }
        });
    }
    Office.context?.document?.addHandlerAsync(Office.EventType.DocumentSelectionChanged, handler);
    return () => {
        Office.context.document.removeHandlerAsync(Office.EventType.DocumentSelectionChanged, {
            handler
        });
    }
}

export const getSelectedImageInfo = (): Promise<{ title: string, description: string }> => {
    return Word.run(async (context) => {
        const range = context.document.getSelection();
        await context.sync();

        const images = range.inlinePictures;
        await context.load(images);

        await context.sync();
        if (images.items.length > 0) {
            const image = images.items[0];
            image.load(['altTextTitle', 'altTextDescription']);
            await context.sync();
            return {
                title: image.altTextTitle,
                description: image.altTextDescription
            }
        }
        return null;
    });
}

export function deselect() {
    doc.selectedText = '';
}

export const runScript = runCode;


export async function insertTitle(titleText: string, headingLevel: number) {
    return await Word.run(async (context) => {
        const doc = context.document;
        const body = doc.body;

        let headingStyle: any;
        switch (headingLevel) {
            case 0:
                headingStyle = Word.BuiltInStyleName.title
                break;
            case 0.5:
                headingStyle = Word.BuiltInStyleName.subtitle
                break;
            case 1:
                headingStyle = Word.BuiltInStyleName.heading1;
                break;
            case 2:
                headingStyle = Word.BuiltInStyleName.heading2;
                break;
            case 3:
                headingStyle = Word.BuiltInStyleName.heading3;
                break;
            case 4:
                headingStyle = Word.BuiltInStyleName.heading4;
                break;
            case 5:
                headingStyle = Word.BuiltInStyleName.heading5;
                break;
            case 6:
                headingStyle = Word.BuiltInStyleName.heading6;
                break;
            default:
                headingStyle = Word.BuiltInStyleName.normal;
        }

        const paragraph = body.insertParagraph(titleText, Word.InsertLocation.end);
        paragraph.styleBuiltIn = headingStyle;
        paragraph.spaceAfter = 6;
        paragraph.spaceBefore = 6;
        await context.sync();
    });
}

export async function insertParagraph(paragraphText: string | string[]) {
    return await Word.run(async (context) => {
        const doc = context.document;
        const body = doc.body;
        if (typeof paragraphText === 'string') {
            const ps = paragraphText.split('\n');

            for (let i = 0; i < ps.length; i++) {
                const paragraph = body.insertParagraph(ps[i], Word.InsertLocation.end);
                paragraph.styleBuiltIn = 'Normal';
                paragraph.spaceAfter = 6;
                paragraph.spaceBefore = 6;
            }
        } else if (Array.isArray(paragraphText)) {
            for (let i = 0; i < paragraphText.length; i++) {
                const paragraph = body.insertParagraph(paragraphText[i], Word.InsertLocation.end);
                paragraph.styleBuiltIn = 'Normal';
                paragraph.spaceAfter = 6;
                paragraph.spaceBefore = 6;
            }
        }

        await context.sync();
    });
}


export function removeLineBreaks(): Promise<any> {
    return Word.run(async function (context) {
        // 获取当前选定的内容
        const selection = context.document.getSelection();
        selection.load("paragraphs/items");

        await context.sync();

        // 临时存储内容和图片
        const contentToInsert = [];

        for (const paragraph of selection.paragraphs.items) {
            paragraph.load("inlinePictures, text");
            await context.sync();

            // 临时保存文本和图片
            let text = paragraph.text;
            const pictures = paragraph.inlinePictures.items;

            // 将文本中的换行符移除
            text = text.replace(/[\r\n]+/g, '');
            contentToInsert.push({ type: 'text', content: text });

            // 按顺序保存图片
            for (const picture of pictures) {
                const base64Image = await picture.getBase64ImageSrc();
                await context.sync();
                contentToInsert.push({ type: 'image', content: base64Image.value });
            }
        }

        // 反转内容顺序以确保正确插入顺序
        contentToInsert.reverse();

        // 在选区后插入处理后的内容
        for (const item of contentToInsert) {
            if (item.type === 'text') {
                selection.insertText(item.content, "After");
            } else if (item.type === 'image') {
                selection.insertInlinePictureFromBase64(item.content, "After");
            }
        }
        selection.delete()
        await context.sync();
    }).catch(function (error) {
        console.log("Error: " + error);
        if (error instanceof OfficeExtension.Error) {
            console.log("Debug info: " + JSON.stringify(error.debugInfo));
        }
    });
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
