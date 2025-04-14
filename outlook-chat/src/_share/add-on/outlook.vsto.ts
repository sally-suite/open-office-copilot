import { ITableOption } from "chat-list/types/api/sheet";
import { buildHtml } from "chat-list/utils";

const getOutlookHost = () => {
    if (!window?.chrome?.webview) {
        throw new Error('No webview2 found, please install webview2 runtime')
    }
    if (!window.chrome.webview?.hostObjects?.sync?.outlook) {
        throw new Error('Outlook host not found')
    }

    return window.chrome.webview.hostObjects.sync.outlook;
}

export const insertText = async (text: string, options: {
    type?: 'text' | 'html' | 'title' | 'paragraph',
    position?: string
} = {
        type: 'html',
        position: ''
    }): Promise<void> => {
    const { type = 'html' } = options;

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

};


export const getSelectedText = async (): Promise<string> => {

}

const getBodyText = async (): Promise<{ text: string, type: 'email' }> => {


}

export const getSelectedTextAndType = async (): Promise<{ text: string, type: 'text' | 'email' }> => {

}


export const getDocumentContent = async () => {
  
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

}

/**
 * 设置邮件主题
 * @param title 邮件主题
 */
export const setSubject = async (title: string): Promise<void> => {

};

/**
 * 设置邮件正文
 * @param text 邮件正文内容
 * @param type 内容类型：'text' 为纯文本，'html' 为 HTML 格式
 */
export const setBody = async (text?: string, type: 'text' | 'html' = 'text'): Promise<void> => {

};

/**
 * 设置收件人
 * @param recipients 收件人数组
 */
export const setToRecipients = async (
    recipients: { displayName: string; emailAddress: string }[]
): Promise<void> => {

};

/**
 * 设置抄送收件人
 * @param recipients 抄送收件人数组
 */
export const setCCRecipients = async (
    recipients: { displayName: string; emailAddress: string }[]
): Promise<void> => {

};

/**
 * 设置密送收件人
 * @param recipients 密送收件人数组
 */
export const setBCCRecipients = async (
    recipients: { displayName: string; emailAddress: string }[]
): Promise<void> => {

};

