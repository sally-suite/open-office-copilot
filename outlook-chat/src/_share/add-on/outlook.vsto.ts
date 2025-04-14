import { ITableOption } from "chat-list/types/api/sheet";
import { arrayToMarkdownTable, buildHtml } from "chat-list/utils";

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
    const { type = 'html', position } = options;
    const outlook = getOutlookHost();
    console.log('insetText', text, position);
    const result = outlook.insertText(text, type, position);
    console.log(result);
}

export const insertImage = async (base64: string, width?: number, height?: number, altTitle?: string, altDescription?: string) => {
    return Promise.resolve()
}

export const insertTable = async (values: string[][], options: ITableOption) => {

    const mark = arrayToMarkdownTable(values, true)
    const html = await buildHtml(mark, false);
    insertText(html, {
        type: 'html',
        position: 'After'
    })
};


export const getSelectedText = async (): Promise<string> => {
    const outlook = getOutlookHost();
    const result = outlook.getSelectedText();
    return result;
}


export const getDocumentContent = async () => {
    const outlook = getOutlookHost();
    const result = outlook.getDocumentContent();
    return result;
}

const getSelectedTextAndType = async () => {
    let text = await getSelectedText();
    if (!text) {
        text = await getDocumentContent();
    }
    return {
        text,
        type: 'text'
    }
}

let timer: any;
const loopSelectedText = (callback: (text: string, type: 'text' | 'email') => void) => {
    timer = setTimeout(async () => {
        const result = await getSelectedTextAndType();

        if (result) {
            const { text, type } = result;
            if (callback) {
                callback(text, type as any);
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
    const outlook = getOutlookHost();
    outlook.setSubject(subject);
}

export const insertParagraph = (body?: string) => {

}


export const openDialog = async (fullUrl: string, options: any = {}, callback?: (result: any) => void): Promise<void> => {
    const { height = 60, width = 30 } = options;

}

/**
 * 设置邮件主题
 * @param title 邮件主题
 */
export const setSubject = async (title: string): Promise<void> => {
    const outlook = getOutlookHost();
    outlook.setSubject(title);
};

/**
 * 设置邮件正文
 * @param text 邮件正文内容
 * @param type 内容类型：'text' 为纯文本，'html' 为 HTML 格式
 */
export const setBody = async (text?: string, type: 'text' | 'html' = 'text'): Promise<void> => {
    const outlook = getOutlookHost();
    outlook.setBody(text, type);
};

/**
 * 设置收件人
 * @param recipients 收件人数组
 */
export const setToRecipients = async (
    recipients: { displayName: string; emailAddress: string }[]
): Promise<void> => {
    const outlook = getOutlookHost();
    console.log(recipients);

    outlook.setToRecipients(JSON.stringify(recipients));
};

/**
 * 设置抄送收件人
 * @param recipients 抄送收件人数组
 */
export const setCCRecipients = async (
    recipients: { displayName: string; emailAddress: string }[]
): Promise<void> => {
    const outlook = getOutlookHost();
    outlook.setCCRecipients(JSON.stringify(recipients));
};

/**
 * 设置密送收件人
 * @param recipients 密送收件人数组
 */
export const setBCCRecipients = async (
    recipients: { displayName: string; emailAddress: string }[]
): Promise<void> => {
    const outlook = getOutlookHost();
    outlook.setBCCRecipients(JSON.stringify(recipients));
};


export const getMailWindowState = (): 'Read' | 'Compose' | 'Unknown' | '' => {
    const outlook = getOutlookHost();
    const state = outlook.getMailWindowState();
    return state;
}