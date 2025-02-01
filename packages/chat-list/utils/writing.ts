import { base64ToFile, buildHtml, copyByClipboard } from "chat-list/utils";

export type SelectedRange = { element: HTMLElement, start: number, end: number } | Range;

const restoreRange = (selectedRange: SelectedRange) => {
    const selection = window.getSelection();
    selection.removeAllRanges();
    if (selectedRange instanceof Range) {
        selection.addRange(selectedRange);
        return 'range';
    } else {
        const element = selectedRange.element as HTMLInputElement;
        const start = selectedRange.start;
        const end = selectedRange.end;
        element.setSelectionRange(start, end);
        element.focus();
        return 'input';
    }
};

const getContentEditableElement = (node: Node): any => {
    const element = node as HTMLElement;
    if (element.contentEditable === 'true') {
        return element;
    } else {
        // 递归查找父节点
        if (element.parentElement) {
            const result = getContentEditableElement(element.parentElement);
            if (result) {
                return result;
            }
        }
    }

    return null;
};

export const getDocumentContent = async (selectedRange: SelectedRange) => {
    const inputNode = restoreRange(selectedRange);
    if (inputNode == 'input') {
        return ((selectedRange as ({ element: HTMLElement, start: number, end: number })).element as HTMLInputElement).value;
    } else {
        // 返回焦点所在的contenteditable元素
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        const container = range.commonAncestorContainer;
        // 查找父级元素的contenteditable为true的元素，如果没有，返回document.body
        const ele = getContentEditableElement(container);

        if (!ele) {
            return document.body.innerText;
        } else {
            return ele.innerText;
        }
    }
};

export const replaceText = async (selectedRange: SelectedRange, text?: string, type: 'text' | 'html' = 'html') => {
    // console.log(text)
    if (type == 'text') {
        await copyByClipboard(text);
        return new Promise((resolve, reject) => {
            const selection = restoreRange(selectedRange);
            if (selection == 'input') {
                document.execCommand('insertText', false, text);
                resolve(null);
            } else {
                // don't know why. but at first time settimeout excute paste actions, everything works as expected
                // if (this.textPasted) {
                // console.log('paste')
                // document.execCommand('paste', true, text)
                // } else {
                setTimeout(() => {
                    document.execCommand('paste', true, text);
                    // this.textPasted = true
                    resolve(null);
                }, 100);
                // }
            }
        });
    } else {
        // const html = await buildHtml(text, true)

        await copyByClipboard(text, text);
        return new Promise((resolve, reject) => {
            const selection = restoreRange(selectedRange);
            if (selection == 'input') {
                document.execCommand('insertText', false, text);
                resolve(null);
            } else {
                // don't know why. but at first time settimeout excute paste actions, everything works as expected
                // if (this.textPasted) {
                // console.log('paste')
                // document.execCommand('paste', true, text)
                // } else {
                setTimeout(() => {
                    document.execCommand('paste', true, text);
                    // this.textPasted = true
                    resolve(null);
                }, 100);
                // }
            }
        });
    }

};

export const insertText = async (selectedRange: SelectedRange, text?: string, type: 'text' | 'html' = 'html') => {
    if (type == 'text') {
        await copyByClipboard(text);
        const inputNode = restoreRange(selectedRange);
        // console.log('inputNode', inputNode)
        if (inputNode == 'input') {

            const selection = window.getSelection();
            selection.collapseToEnd();
            // console.log('insertText', text)

            return document.execCommand('insertText', false, text);
        } else {
            const selection = window.getSelection();
            selection.collapseToEnd();
            // console.log('paste', text)

            setTimeout(() => {
                document.execCommand('paste', true, text);
            }, 100);
        }

    } else {
        // const html = await buildHtml(text, true)
        await copyByClipboard(text, text);
        const inputNode = restoreRange(selectedRange);
        // console.log('inputNode', inputNode)
        if (inputNode == 'input') {

            const selection = window.getSelection();
            selection.collapseToEnd();
            // console.log('insertText', text)

            return document.execCommand('insertText', false, text);
        } else {
            const selection = window.getSelection();
            selection.collapseToEnd();
            // console.log('paste', html)

            setTimeout(() => {
                document.execCommand('paste', true, text);
            }, 100);
        }
    }

};

export const insertImage = (selectedRange: SelectedRange, img?: HTMLDivElement, base64?: string) => {

    if (!img && !base64) {
        return;
    }

    if (base64) {
        // 创建一个新的ClipboardItem
        const blob = base64ToFile(base64, 'image.png');
        const clipboardItem = new ClipboardItem({ 'image/png': blob });
        navigator.clipboard.write([clipboardItem]);

    } else {
        const s = window.getSelection();
        s.removeAllRanges();
        s.addRange(new Range());
        s.getRangeAt(0).selectNode(img);
        // TODO: use clipboard to copy
        document.execCommand('copy');
        s.removeAllRanges();
    }

    const inputNode = restoreRange(selectedRange);
    // console.log('inputNode', inputNode)
    if (inputNode == 'range') {
        const selection = window.getSelection();
        selection.collapseToEnd();
        setTimeout(() => {
            document.execCommand('paste');
        }, 100);
    }
};
