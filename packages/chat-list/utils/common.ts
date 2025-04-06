/* eslint-disable @typescript-eslint/ban-ts-comment */
import { SHEET_CHAT_SITE } from 'chat-list/config/site';
import { Platform } from 'chat-list/types/plugin';
import { marked } from 'marked';

export function template(template: string, data: any) {
    return template.replace(/\{\{(.*?)\}\}/g, (_, key) => data[key.trim()] || '');
}

export const extractCodeFromMd = (inputText: string) => {
    if (!inputText) {
        return '';
    }
    if (!inputText.includes('```')) {
        return inputText;
    }
    // Regular expression to extract code block, even if it doesn't have an ending ```
    const regex = /```.*\n*([\s\S]*?)(```|$)/;
    const match = regex.exec(inputText);

    if (match && match[1]) {
        const exp = match[1];
        return exp;
    }

    return '';
};

// export const extractJsonDataFromMd = (inputText: string) => {
//     try {
//         const result = JSON.parse(inputText);
//         return result;
//     } catch (err) {
//         // Regular expression to extract JSON data
//         const regex = /```.*\n([\s\S]+?)```/;
//         const match = regex.exec(inputText);

//         if (match && match[1]) {
//             const jsonData = match[1];
//             try {
//                 const jsonObject = JSON.parse(jsonData);
//                 return jsonObject;
//             } catch (error) {
//                 console.error('Error parsing JSON:', error);
//                 return {};
//             }
//         }
//         return {};
//     }
// }

export const extractJsonDataFromMd = (inputText: string) => {
    try {
        const jsonText = inputText;
        const result = JSON.parse(jsonText);
        return result;
    } catch (err) {
        const renderer = new marked.Renderer();
        const codeBlocks: any[] = [];
        //@ts-ignore
        renderer.code = (code, infostring, escaped) => {
            codeBlocks.push({ code, infostring });
            return "";
        };
        marked(inputText, { renderer });

        let jsonData;
        if (codeBlocks.length > 0) {
            jsonData = codeBlocks[0].code.text;
        } else {
            const regex = /```(?:json)?\s*([\s\S]+?)\s*```/;
            const match = regex.exec(inputText);
            if (match && match[1]) {
                jsonData = match[1];
            }
        }

        try {
            const jsonObject = JSON.parse(jsonData);
            return jsonObject;
        } catch (error) {
            console.error("Error parsing JSON:", error);
            return {};
        }
    }
};


export const extractToolJsonDataFromMd = (inputText: string) => {
    try {
        return JSON.parse(inputText);
    } catch (err) {
        const renderer = new marked.Renderer();
        const codeBlocks: string[] = [];
        //@ts-ignore
        renderer.code = (code, infostring) => {
            if (infostring?.trim() === "tools") {
                codeBlocks.push(code);
            }
            return "";
        };

        marked(inputText, { renderer });

        let jsonData = codeBlocks.length > 0 ? codeBlocks[0] : null;

        if (!jsonData) {
            const regex = /```tools\s*([\s\S]+?)\s*```/;
            const match = regex.exec(inputText);
            if (match && match[1]) {
                jsonData = match[1];
            }
        }

        if (jsonData) {
            try {
                return JSON.parse(jsonData);
            } catch (error) {
                console.error("Error parsing JSON from 'tools' block:", error);
            }
        }
        return {};
    }
};


export const extractJsFunctionFromMd = (inputText: string) => {
    // Regular expression to extract JSON data
    const regex = /```.*\n([\s\S]+?)```/;
    const match = regex.exec(inputText);

    if (match && match[1]) {
        const jsCode = match[1];
        try {
            const fun = eval(`(function() {${jsCode}; \n return handleSheetData;})`);
            return fun();
        } catch (err) {
            console.error("Error parsing JS:", err);
        }
    }

    return () => {
        throw new Error("No JS code found in the message");
    };
};


export const absolute = (url: string) => {
    return `${SHEET_CHAT_SITE}${url}`;
};

export const sleep = (ms?: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms || 500));
};

export const uuid = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
};

export const isCtrlPlus = (e: any, key) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    return (
        (isMac && e.metaKey && !e.ctrlKey && !e.altKey && e.key === key) ||
        (!isMac && e.ctrlKey && !e.metaKey && !e.altKey && e.key === key)
    );
};

export const isProd = () => {
    return process.env.NODE_ENV === 'production';
};

// export const memoize = (func: any) => {
//     let cache: any;
//     return function (...args: any[]) {
//         if (cache) {
//             return cache;
//         } else {
//             const result = func(...args);
//             cache = result;
//             return result;
//         }
//     };
// }

export const memoize = <T extends (...args: any[]) => any>(func: T) => {
    const cache = new Map<string, ReturnType<T>>();

    return function (...args: Parameters<T>): ReturnType<T> {
        const key = JSON.stringify(args);

        if (cache.has(key)) {
            return cache.get(key)!;
        } else {
            const result = func(...args);
            cache.set(key, result);
            return result;
        }
    };
};

/**
 * cache function result in time
 * @param fn 
 * @param time 
 * @returns 
 */
export const cacheInTime = (fn: (...arg: any[]) => void, time: number) => {
    const lastResult: { time: number, result: any } = {
        time: 0,
        result: null
    };
    return function (...args: any[]) {
        // 加入对时间的判断
        if (Date.now() - lastResult.time < time) {
            return lastResult.result;
        }
        lastResult.time = Date.now();
        lastResult.result = fn(...args);
        return lastResult.result;
    };
};




/**
 *  throttle function
 * @param fn 
 * @param delay 
 * @returns 
 */
export function throttle(fn: (...arg: any) => void, delay = 300) {
    let ready = true;

    return (...args: any) => {
        if (!ready) {
            return;
        }

        ready = false;
        fn(...args);

        setTimeout(() => {
            ready = true;
        }, delay);
    };
}


export const debounce = (func: any, wait = 300) => {
    let timeout: any;
    return function (...args: any[]) {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => {
            func.apply(this, args);
        }, wait);
    };
};

export const blobToDataURL = async (blob: Blob): Promise<string> => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = function () {
            resolve(reader.result as string);
        };
        reader.readAsDataURL(blob);
    });
};


export const blobToBase64 = async (blob: Blob): Promise<string> => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = function () {
            const base64 = (reader.result as string).split(',')[1];
            resolve(base64);
        };
        reader.onerror = function () {
            console.error('Error reading blob as base64');
        };
        reader.readAsDataURL(blob);
    });
};

export const blobToArrayBuffer = async (blob: Blob): Promise<ArrayBuffer> => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = function (e) {
            const result = e.target.result as ArrayBuffer;
            resolve(result);
        };
        reader.readAsArrayBuffer(blob);
    });
};

export const blobToBase64Image = async (file: Blob) => {
    const base64 = await blobToBase64(file);
    return `data:${file.type || 'image/png'};base64,${base64}`;
};

function getMimeType(base64Url: string) {
    if (base64Url.startsWith('http')) {
        // 使用正则表达式获取http url的后缀名，？号之前部分的后缀名
        const url = base64Url.split('?')[0];
        // 使用正则表达式提取url的后缀名
        const matchs = /\.[a-zA-Z0-9]+/g.exec(url);
        if (matchs && matchs.length > 0) {
            return `image/${matchs[0].substring(1)}`;
        }

        return 'image/png';
    }
    const matches = base64Url.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-+.]+);base64,/);
    if (matches && matches.length > 1) {
        return matches[1];
    }
    return null;
}

export function base64ToBlob(base64: string, mimeType: string) {
    // 直接将 Base64 字符串解码为二进制数据
    const byteString = atob(base64);

    // 创建一个 `Uint8Array` 来存储解码后的二进制数据
    const byteArray = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
        byteArray[i] = byteString.charCodeAt(i);
    }

    // 将 `Uint8Array` 转换为 `Blob` 对象
    return new Blob([byteArray], { type: mimeType });
}

export async function base64ToFile(base64Url: string, fileName: string, mime?: string) {
    let mimeType;
    if (!mime) {
        mimeType = getMimeType(base64Url);
        if (!mimeType) {
            console.error('无法解析MIME类型');
            return null;
        }
    } else {
        mimeType = mime;
    }
    //判断是否为图片base64 data url,然后 提取base64字符串中的数据部分
    let base64 = base64Url;
    if (base64Url.startsWith('data:')) {
        base64 = base64Url.split(',')[1];
    }

    const blob = base64ToBlob(base64, mimeType);

    return new File([blob], fileName, { type: mimeType });
}

export const platform = (): Platform => {

    // @ts-ignore
    if (typeof window?.google?.script !== 'undefined') {
        return 'google';
    }
    // @ts-ignore
    if (typeof window.Office !== 'undefined') {
        return 'office';
    }
    // @ts-ignore
    if (typeof window.Asc !== 'undefined') {
        return 'only';
    }
    // @ts-ignore
    if (typeof window.chrome?.storage !== 'undefined') {
        return 'chrome';
    }

    return 'other';
};


export const copyTextByCommand = (type: 'text' | 'html', html: string) => {
    let textarea;
    if (type == 'html') {
        textarea = document.createElement('div');
        textarea.innerHTML = html.trim();
    } else {
        textarea = document.createElement('textarea');
        textarea.value = html.trim();
    }
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'absolute';
    textarea.style.left = '-99999px';

    document.body.appendChild(textarea);
    const range = document.createRange();
    range.selectNode(textarea);
    const selection = document.getSelection();
    selection.empty();
    selection.addRange(range);
    document.execCommand('copy');
    document.body.removeChild(textarea);
};

export const copyByClipboard = async (content: string, html?: string) => {
    if (html) {
        try {
            copyTextByCommand('html', html);
        } catch (e) {
            const htmlBlob = new Blob([html], {
                type: 'text/html',
            });
            const textBlob = new Blob([content], {
                type: 'text/plain',
            });
            await navigator.clipboard.write([
                new ClipboardItem({
                    [htmlBlob.type]: htmlBlob,
                    [textBlob.type]: textBlob,
                }),
            ]);
        }
    } else {
        try {
            const textBlob = new Blob([content], {
                type: 'text/plain',
            });
            await navigator.clipboard.write([
                new ClipboardItem({
                    [textBlob.type]: textBlob,
                }),
            ]);
        } catch (e) {
            copyTextByCommand('text', content);
        }
    }
};

export function extractMentions(text: string) {
    const mentionRegex = /@([^\s]+)/g;
    const mentions = [];
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
        mentions.push(match[1].toLowerCase());
    }
    return mentions;
}

export function removeMentions(text: string) {
    // 使用正则表达式将文本中的所有@提及替换为空字符串
    const mentionRegex = /^@([^\s]+)/g;
    const textWithoutMentions = text.replace(mentionRegex, '');
    return textWithoutMentions.trim();
}

export const extractCommand = (text: string) => {
    const commandRegex = /^[/@]([^\s]+)/;
    const match = text.match(commandRegex);
    if (match) {
        return match[1];
    }
    return '';

};

export function existMentions(text: string) {
    const mentionRegex = /^@([^\s]+)/g;
    return mentionRegex.test(text);
}

export function arrayToMarkdownTable(dataArray: (string | number)[][], showHeader = true) {
    if (!Array.isArray(dataArray) || dataArray.length === 0 || !Array.isArray(dataArray[0])) {
        return 'Invalid input. Please provide a non-empty 2D array.';
    }

    // // 构建表头
    // const headers = dataArray[0].map(header => header.toString());
    // const headerRow = `| ${headers.join(' | ')} |`;

    // // 构建分隔线
    // const separatorRow = `|${Array.from({ length: headers.length }, () => ' --- ').join('|')}|`;

    // // 构建数据行
    // const dataRows = dataArray.slice(1).map(row => `| ${row.map(item => item.toString()).join(' | ')} |`);

    // // 拼接成Markdown表格
    // const markdownTable = [headerRow, separatorRow, ...dataRows].join('\n');

    // return markdownTable;
    const headers = dataArray[0];
    const headerRow = showHeader ? '| ' + headers.map(header => header?.toString() || "").join(' | ') + ' |' : '| ' + headers.map(header => " ").join(' | ') + ' |';
    const separatorRow = '| ' + Array.from({ length: headers?.length }, () => ' --- ').join(' | ') + ' |';
    const dataRows = dataArray.slice(1).map(row => '| ' + row.map(item => item?.toString() || "").join(' | ') + ' |');
    const markdownTable = [headerRow, separatorRow, ...dataRows];
    return markdownTable.join('\n');
}

export function objectToHorizontalArray(obj: any) {
    // 初始化一个空数组，用于存储转换后的二维数组
    const resultArray: any = [];

    // 将对象的所有属性名作为第一行添加到结果数组中
    resultArray.push(Object.keys(obj));

    // 将对象的所有属性值作为第二行添加到结果数组中
    resultArray.push(Object.values(obj));

    return resultArray;
}

export function isTwoDimensionalArray(value: string[][]) {
    return Array.isArray(value) && value.length > 0 && Array.isArray(value[0]);
}

export function capitalizeFirstLetter(str: string) {
    // 确保输入不为空
    if (!str) {
        return str;
    }

    // 将首字母转换为大写，然后与剩余部分拼接
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// IE 不支持 toggle 第二个参数
export function toggleClass(className: string, flag: boolean, el: HTMLElement = document.body) {
    el.classList[flag ? 'add' : 'remove'](className);
}

export function snakeToWords(snakeCase: string) {
    // 将下划线替换为空格
    let words = snakeCase.replace(/_/g, ' ');

    // 将每个单词的首字母大写
    words = words.replace(/\b\w/g, match => match.toUpperCase());

    return words;
}

export function formatNumber(number: number) {
    if (number >= 1000000) {
        const million = number / 1000000;
        return million % 1 === 0 ? million + 'M' : million.toFixed(1) + 'M';
    } else if (number >= 1000) {
        const thousand = number / 1000;
        return thousand % 1 === 0 ? thousand + 'K' : thousand.toFixed(1) + 'K';
    } else {
        return number.toString();
    }
}

export function formatCurrency(number: number): string {
    // 将数字格式化为字符串，保留两位小数
    const formatted = number.toFixed(2);
    // 移除不必要的零和小数点
    const cleaned = formatted.replace(/\.?0+$/, '');
    // 在前面添加美元符号
    return `$${cleaned}`;
}

export const formatNumberWithCommas = (num: number) => {
    // 格式化数字，按照英文习惯加逗号
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export function isBase64(str: string) {
    const base64Regex = /^(?:[A-Za-z0-9+/]{4})*?(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
    return base64Regex.test(str);
}

/**
 * convert zhipu tool arguments to OpenAI arguments
 * @param response 
 * @returns 
 */
export function adaptToolArguments(response: any) {
    function convertItems(obj: any): any {
        if (Array.isArray(obj)) {
            return obj.map((item: any) => Array.isArray(item) ? item : convertItems(item));
        } else if (obj instanceof Object && Object.prototype.hasOwnProperty.call(obj, 'Items')) {
            if (obj.Items) {
                return convertItems(obj.Items);
            } else {
                return [];
            }
        } else if (obj instanceof Object) {
            return adaptToolArguments(obj);
        }
        return obj;
    }

    for (const key in response) {
        if (Object.prototype.hasOwnProperty.call(response, key) && response[key] instanceof Object) {
            response[key] = convertItems(response[key]);
        }
    }
    return response;
}


export function flattenArray(arr: any[]) {
    return arr.reduce((acc, cur) => {
        if (Array.isArray(cur)) {
            return acc.concat(flattenArray(cur));
        } else {
            return acc.concat(cur);
        }
    }, []);
}


export function containsEmoji(text: string): boolean {
    // 使用正则表达式匹配 Emoji 的 Unicode 范围
    const emojiRegex = /[\u{1F600}-\u{1F64F}|\u{1F300}-\u{1F5FF}|\u{1F680}-\u{1F6FF}|\u{1F1E0}-\u{1F1FF}]/u;
    return emojiRegex.test(text);
}

export const isMobile = () => {
    if (typeof document === 'undefined') {
        return false;
    }
    if (document.body.clientWidth < 768) {
        return true;
    }
    return /mobile|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
    );
};

export function loadScript(url: string) {
    return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.type = "text/javascript";
        //@ts-ignore
        if (script?.readyState) {  // 仅限IE
            //@ts-ignore
            script.onreadystatechange = function () {
                //@ts-ignore
                if (script.readyState == "loaded" || script.readyState == "complete") {
                    //@ts-ignore
                    script.onreadystatechange = null;
                    resolve(null);
                }
            };
        } else {  // 其他浏览器
            script.onload = function () {
                resolve(null);
            };
        }
        // 设置脚本URL
        script.src = url;

        // 将脚本元素插入到HTML中
        document.getElementsByTagName("head")[0].appendChild(script);
    });

}

export function addBlockQuote(content: string) {
    if (!content.trim()) return '';

    return content.replace(/^(.*)$/gm, '> $1');
}

/**
 * 给颜色加透明度
 * @param hex color,#FFFFFFF
 * @param alpha 0-1
 * @returns 
 */
export function hexToRgba(hexColor: string, opacity: number) {
    if (!hexColor) {
        return '';
    }
    // 确保透明度在0-1范围内
    opacity = Math.min(1, Math.max(0, opacity));

    // 移除#号（如果存在）
    hexColor = hexColor.replace('#', '');

    // 处理3位和6位十六进制颜色
    if (hexColor.length === 3) {
        hexColor = hexColor.split('').map(char => char + char).join('');
    }

    // 解析RGB值
    const r = parseInt(hexColor.substr(0, 2), 16);
    const g = parseInt(hexColor.substr(2, 2), 16);
    const b = parseInt(hexColor.substr(4, 2), 16);

    // 返回RGBA格式的颜色
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export const htmlToText = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
};