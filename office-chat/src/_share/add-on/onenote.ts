import { ITableOption } from "chat-list/types/api/sheet";

export const insertText = async (text: string, options: {
    type?: 'text' | 'html' | 'title' | 'paragraph'
    position?: Word.InsertLocation
} = {
        type: 'html',
        position: Word.InsertLocation.after
    }): Promise<void> => {
    const { type = 'html', position = Word.InsertLocation.after } = options;
    const context = await Word.run(async (context) => context);

    const selection = context.document.getSelection();
    if (type == 'text') {
        selection.insertText(text, position as any);
    } else if (type === 'html') {
        selection.insertHtml(text, position);
    } else if (type === 'paragraph') {
        selection.insertParagraph(text, position as any);
    } else if (type === 'title') {
        // 插入标题
        selection.insertParagraph(text, Word.InsertLocation.before);
    }
    return context.sync();
}

// 插入一个段落
// export const insertParagraph = async (text: string, position: Word.InsertLocation = Word.InsertLocation.after): Promise<void> => {
//     const context = await Word.run(async (context) => context);
//     const selection = context.document.getSelection();
//     const paragraph = selection.insertParagraph(text, position);
//     paragraph.font.bold = false;
//     return context.sync();
// }

export const insertImage = async (base64: string, width?: number, height?: number, altTitle?: string, altDescription?: string) => {
    return await Word.run(async function (context) {
        // 获取当前选定的范围
        var range = context.document.getSelection();
        // 在选定范围中插入图片
        const img = base64.split(',')[1];
        const picture = range.insertInlinePictureFromBase64(img, Word.InsertLocation.replace);
        picture.load(['altTextTitle', 'altTextDescription']);
        await context.sync();
        picture.altTextTitle = altTitle;
        picture.altTextDescription = altDescription;
        picture.width = width;
        picture.height = height;

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
    var body = context.document.body;

    // 插入一个新的表格
    var table = body.insertTable(values.length, values[0].length, "End", values);
    // table.styleBuiltIn = Word.BuiltInStyleName.gridTable5Dark_Accent2;
    // table.styleFirstColumn = false;
    // table.style.
    table.getBorder(Word.BorderLocation.all).color = borderColor;
    // table.rows.load(['items'])
    // await context.sync();
    // table.rows.items[0].font.color = headerFontColor;
    // table.rows.items[0].shadingColor = headerRowColor;
    // // 遍历二维数组并将数据填充到表格中
    // for (var i = 1; i < values.length; i++) {
    //     let row = table.rows.items[i];
    //     row.font.color = rowFontColor;
    //     if (i % 2 == 0) {
    //         row.shadingColor = secondRowColor;
    //     } else {
    //         row.shadingColor = firstRowColor;
    //     }
    // }
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
    const context = await Word.run(async (context) => context)
    var body = context.document.body;
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


export function runScript(code: string) {
    eval(`(${code})()`);
}
