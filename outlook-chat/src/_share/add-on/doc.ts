import { ITableOption } from "chat-list/types/api/sheet";
import { buildHtml } from "chat-list/utils";


export const insertText = async (text: string, options: {
    type?: 'text' | 'html' | 'title' | 'paragraph',
    position?: string
} = {
        type: 'html',
        position: ''
    }): Promise<void> => {
    const { type = 'html' } = options;

    return new Promise((resolve, reject) => {
        Office.context.mailbox.item.body.getTypeAsync(async (asyncResult) => {
            if (asyncResult.status === Office.AsyncResultStatus.Failed) {
                console.log(asyncResult.error.message);
                return;
            }

            // Insert data of the appropriate type into the body.
            if (asyncResult.value === Office.CoercionType.Html) {
                const html = await buildHtml(text)
                // Insert HTML into the body.
                Office.context.mailbox.item.body.setSelectedDataAsync(html,
                    { coercionType: Office.CoercionType.Html, asyncContext: { optionalVariable1: 1, optionalVariable2: 2 } },
                    (asyncResult) => {
                        if (asyncResult.status === Office.AsyncResultStatus.Succeeded) {
                            resolve();
                        } else if (asyncResult.status === Office.AsyncResultStatus.Failed) {
                            console.log(asyncResult.error.message);
                            reject(asyncResult.error.message)
                            return;
                        }
                    });
            }
            else {
                // Insert plain text into the body.
                Office.context.mailbox.item.body.setSelectedDataAsync(text,
                    { coercionType: Office.CoercionType.Text, asyncContext: { optionalVariable1: 1, optionalVariable2: 2 } },
                    (asyncResult) => {
                        if (asyncResult.status === Office.AsyncResultStatus.Succeeded) {
                            resolve();
                        } else if (asyncResult.status === Office.AsyncResultStatus.Failed) {
                            console.log(asyncResult.error.message);
                            reject(asyncResult.error.message)
                            return;
                        }
                    });
            }
        });
    })
}

export const insertImage = async (base64: string, width?: number, height?: number, altTitle?: string, altDescription?: string) => {
    return Promise.resolve()
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

    return new Promise(async (resolve, reject) => {
        try {
            // 创建表格元素
            let table = `<table style="border-collapse: collapse; border: 1px solid ${borderColor}; width: 100%;">`;

            // 构建表头行
            if (values.length > 0) {
                table += `<tr style="background-color: ${headerRowColor}; color: ${headerFontColor};">`;
                for (let headerCell of values[0]) {
                    table += `<th style="border: 1px solid ${borderColor}; padding: 8px;">${headerCell}</th>`;
                }
                table += '</tr>';
            }

            // 构建表格主体
            for (let i = 1; i < values.length; i++) {
                const rowColor = i % 2 === 0 ? secondRowColor : firstRowColor;
                table += `<tr style="background-color: ${rowColor}; color: ${rowFontColor};">`;
                for (let cell of values[i]) {
                    table += `<td style="border: 1px solid ${borderColor}; padding: 8px;">${cell}</td>`;
                }
                table += '</tr>';
            }

            // 构建页脚行（可选）
            if (options.footerRowColor) {
                table += `<tr style="background-color: ${footerRowColor}; color: ${rowFontColor};">`;
                for (let footerCell of values[values.length - 1]) {
                    table += `<td style="border: 1px solid ${borderColor}; padding: 8px;">${footerCell}</td>`;
                }
                table += '</tr>';
            }

            table += '</table>';

            await insertText(table, { type: 'html' })
            resolve(null);
        } catch (error) {
            reject(error);
        }
    });
};


export const getSelectedText = async (): Promise<string> => {
    // return new Promise((resolve, reject) => {
    //     if (Office.context.mailbox.item && Office.context.mailbox.item.getSelectedDataAsync) {
    //         Office.context.mailbox.item.getSelectedDataAsync(Office.CoercionType.Text, function (result: any) {
    //             if (result.status === Office.AsyncResultStatus.Succeeded) {
    //                 // console.log("Selected text: " + result.value);
    //                 resolve(result?.value?.data)
    //                 // callback(result.value);
    //             } else {
    //                 resolve(null)
    //                 console.error("Error getting selected text: " + result.error.message);
    //             }
    //         });
    //     } else {
    //         resolve(null)
    //     }
    // });
    const result = await getSelectedTextAndType();
    return result?.text;
}

const getBodyText = async (): Promise<{ text: string, type: 'email' }> => {
    return new Promise((resolve, reject) => {
        if (Office.context.mailbox.item && Office.context.mailbox.item.body) {
            Office.context.mailbox.item.body.getAsync(Office.CoercionType.Text, function (result: any) {
                console.log(result)
                if (result.status === Office.AsyncResultStatus.Succeeded) {
                    // console.log("Selected text: " + result.value);
                    // resolve(result?.value)
                    resolve({ text: result?.value, type: 'email' })
                } else {
                    resolve(null)
                }
            });
        } else {
            resolve(null)
        }
    })

}

export const getSelectedTextAndType = async (): Promise<{ text: string, type: 'text' | 'email' }> => {
    return new Promise((resolve, reject) => {
        if (Office.context.mailbox.item && Office.context.mailbox.item.getSelectedDataAsync) {
            Office.context.mailbox.item.getSelectedDataAsync(Office.CoercionType.Text, function (result: any) {
                if (result.status === Office.AsyncResultStatus.Succeeded) {
                    // console.log("Selected text: " + result.value);
                    resolve({ text: result?.value?.data, type: 'text' })
                    // callback(result.value);
                } else {
                    resolve(null)
                    console.error("Error getting selected text: " + result.error.message);
                }
            });
        } else if (Office.context.mailbox.item && Office.context.mailbox.item.body) {
            Office.context.mailbox.item.body.getAsync(Office.CoercionType.Text, function (result: any) {
                console.log(result)
                if (result.status === Office.AsyncResultStatus.Succeeded) {
                    // console.log("Selected text: " + result.value);
                    // resolve(result?.value)
                    resolve({ text: result?.value, type: 'email' })
                } else {
                    resolve(null)
                }
            });
        } else {
            resolve(null)
        }

    })
}


export const getDocumentContent = async () => {
    const result = await getBodyText();
    return result?.text || "";
}

let timer: any;
const loopSelectedText = (callback: (text: string, type: 'text' | 'email') => void) => {
    timer = setTimeout(async () => {
        const result = await getSelectedTextAndType();

        if (result) {
            const { text, type } = result;
            if (callback) {
                callback(text, type);
            }
        }

        await loopSelectedText(callback);
    }, 1000);
}

export const registSelectEvent = (callback: (text: string, type: 'text' | 'email') => void) => {
    loopSelectedText((txt, type) => {
        callback(txt, type);
    })
    return () => {
        if (timer) {
            clearTimeout(timer);
        }
    }
}

export const deselect = () => {

}


export const getSelectedImageInfo = (): Promise<{ title: string, description: string }> => {
    return null;
}


export function runScript(code: string) {
    eval(`(${code})()`);
}


export const insertTitle = (subject: string) => {
    return new Promise((resolve, reject) => {
        const item = Office.context.mailbox.item;
        item.subject.setAsync(subject, { asyncContext: { optionalVariable1: 1, optionalVariable2: 2 } },
            (asyncResult) => {
                if (asyncResult.status === Office.AsyncResultStatus.Failed) {
                    console.error("Action failed with error: " + asyncResult.error.message);
                    reject(asyncResult.error.message);
                    return;
                }
                resolve(null)
                /*
                  The subject was successfully set.
                  Run additional operations appropriate to your scenario and
                  use the optionalVariable1 and optionalVariable2 values as needed.
                */
            });
    })
}
export const insertParagraph = (body?: string) => {
    return new Promise((resolve, reject) => {
        const item = Office.context.mailbox.item;
        item.body.getTypeAsync((asyncResult) => {
            if (asyncResult.status === Office.AsyncResultStatus.Failed) {
                reject(asyncResult.error.message);
                return;
            }

            // Prepend data of the appropriate type to the body.
            if (asyncResult.value === Office.CoercionType.Html) {
                // Prepend HTML to the body.
                item.body.prependAsync(body,
                    { coercionType: Office.CoercionType.Html, asyncContext: { optionalVariable1: 1, optionalVariable2: 2 } },
                    (asyncResult) => {
                        if (asyncResult.status === Office.AsyncResultStatus.Failed) {
                            console.log(asyncResult.error.message);
                            reject(asyncResult.error.message);
                            return;
                        }
                        resolve(null)
                        /*
                          Run additional operations appropriate to your scenario and
                          use the optionalVariable1 and optionalVariable2 values as needed.
                        */
                    });
            }
            else {
                // Prepend plain text to the body.
                item.body.prependAsync(
                    body,
                    { coercionType: Office.CoercionType.Text, asyncContext: { optionalVariable1: 1, optionalVariable2: 2 } },
                    (asyncResult) => {
                        if (asyncResult.status === Office.AsyncResultStatus.Failed) {
                            console.log(asyncResult.error.message);
                            reject(asyncResult.error.message);
                            return;
                        }
                        resolve(null)
                        /*
                          Run additional operations appropriate to your scenario and
                          use the optionalVariable1 and optionalVariable2 values as needed.
                        */
                    });
            }
        });
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