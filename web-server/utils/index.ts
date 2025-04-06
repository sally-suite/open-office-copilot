import { DOMAIN_NAME } from "@/constants/site"
import randomstring from 'randomstring';
import dayjs from 'dayjs'
import { marked } from 'marked';

export const absolute = (path: string) => {
    return `${DOMAIN_NAME || ""}${path}`
}

export function generateOrderNumber() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const randomStr = randomstring.generate({
        length: 5,
        capitalization: 'uppercase'
    });

    return `${year}${month}${day}${randomStr}`;
}

export const addDays = (date: Date, daysToAdd: number) => {
    const currentDate = dayjs(date);
    return currentDate.add(daysToAdd, 'day').toDate();
}

export const formatDate = (date: Date) => {
    // 使用 dayjs 格式化日期
    return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
}

export const formatNumber = (num: number) => {
    // 格式化数字，按照英文习惯加逗号
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
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
    )
}

export const isDev = () => {
    return process.env.NEXT_PUBLIC_VERCEL_ENV === 'development'
}


export const copyByClipboard = async (content: string, html: string) => {
    if (typeof document.execCommand !== 'undefined') {
        const textarea = document.createElement('div');
        // textarea.className = "markdown";
        textarea.innerHTML = html;
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
    } else {
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

}

export function template(template: string, data: any) {
    return template.replace(/\{\{(.*?)\}\}/g, (_, key) => data[key.trim()] || '');
}

export const extractJsonDataFromMd = (inputText) => {
    try {
        let jsonText = inputText;
        const result = JSON.parse(jsonText);
        return result;
    } catch (err) {
        const renderer = new marked.Renderer();
        const codeBlocks = [];
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

export const capitalizeFirstLetter = (input: string) => {
    if (!input) return ''; // 防止传入空字符串的情况
    return input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();
}