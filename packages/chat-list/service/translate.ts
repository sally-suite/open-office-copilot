import sheeApi from '@api/sheet'
import { chat, chatByPrompt } from 'chat-list/service/message';
import { getValues } from 'chat-list/service/sheet';
import { extractJsonDataFromMd, isTwoDimensionalArray, template } from '../utils';
import { IChatResult } from 'chat-list/types/chat';

export async function translateSheetByGoogle(sourceLanguage: string, targetLanguage: string, mode?: string) {
    // const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    // const sheet = activeSpreadsheet.getActiveSheet();
    // const range = _getActiveRange();
    const values = await getValues();
    const { col, row, colNum, rowNum } = await sheeApi.getRowColNum();

    // 将数据转换为 CSV 文本
    const name = 'Sheet' + (Math.random() * 100).toFixed(0);
    let isActive = false;
    for (let i = 0; i < values.length; i++) {
        const rowData = values[i];
        // 翻译 CSV 文本

        const translatedCSV = await sheeApi.translateText(
            JSON.stringify(rowData),
            sourceLanguage,
            targetLanguage
        );
        const value = JSON.parse(translatedCSV);
        if (!mode || mode == 'overwrite') {
            await sheeApi.setValuesByRange(value, row + i, col, 1, colNum)
        } else {
            if (!isActive) {
                await sheeApi.initSheet(name, [], { active: true });
                isActive = true;
            }
            await sheeApi.setValuesByRange(value, row + i, col, 1, colNum)
        }
    }
}


function CSVToArray(csv: string) {
    const rows: string[] = csv.split('\n');
    const result = [];

    for (let i = 0; i < rows.length - 1; i++) {
        const row = rows[i].split('|');
        if (row.length <= 0) {
            continue;
        }
        result.push(row);
    }
    return result;
}

const transDataPrompt = `You're a translation expert, I need you to translate user input to {{targetLanguage}} language using {{style}} style.  
  
RULES:

- input data is in json formt array,
- output data is in json formar 
- output data should be in the same format as the original data
- Return an object and put the translated data into translations field

OUTPU EXAMPLE:

\`\`\`json
{
    "translations": [
        [
            "data 1",
            "data 2"
        ]
    ]
}
\`\`\`
`;

export function buildTransLateMessages(data: string[][], sourceLanguage: string, targetLanguage: string, style: string) {
    const tableData = JSON.stringify(data, null, 2);
    const prompt = template(transDataPrompt, {
        sourceLanguage,
        targetLanguage,
        style
    });
    const context = {
        role: 'system',
        content: prompt,
    };

    return [
        context,
        {
            role: 'user',
            content: `User input data :\n\`\`\`json\n${tableData}\n\`\`\``
        }];
}

export async function translateSheetByGpt(
    sourceLanguage: string,
    targetLanguage: string,
    mode?: 'overwrite' | 'new-sheet',
    style = 'Formal',
    sheetName = '',
    batch = 1
) {
    // const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const values = await getValues(0, sheetName);
    const { col, row, colNum, rowNum } = await sheeApi.getRowColNum();
    if (!values.length) {
        throw new Error(`I'm sorry, I can't deal with your request.`);
    }
    const name = 'Sheet' + (Math.random() * 100).toFixed(0);
    let isActive = false;
    for (let i = 0; i < values.length; i += batch) {
        // 这句有bug，帮我修复
        const rowData = values.slice(i, i + batch);

        console.log(rowData)
        const messages: any = buildTransLateMessages(
            rowData,
            sourceLanguage,
            targetLanguage,
            style || 'Formal'
        );
        const result = await chat({
            messages,
            temperature: 0.5,
        });
        const data = extractJsonDataFromMd(result.content);
        console.log(data)
        if (!data) {
            continue;
        }
        let value = data;
        if (!Array.isArray(data)) {
            if (Array.isArray(data.data)) {
                value = data.data;
            } else if (Array.isArray(data.translations)) {
                value = data.translations;
            } else {
                throw new Error(`I'm sorry, I can't deal with your request.`);
            }
        }

        if (isTwoDimensionalArray(value)) {
            if (!mode || mode == 'overwrite') {
                console.log(value, row + i, col, value.length, value[0].length)
                await sheeApi.setValuesByRange(value, row + i, col, value.length, value[0].length)
            } else {
                if (!isActive) {
                    await sheeApi.initSheet(name, [], { active: true });
                    isActive = true;
                }
                console.log(value, row + i, col, value.length, value[0].length)
                await sheeApi.setValuesByRange(value, row + i, col, value.length, value[0].length)
            }
        }
    }
}

export const translate = async (params: {
    text: string, language: string,
    tone: string,
    isTranslate: boolean,
}, callback?: (done: boolean, result: IChatResult, stop: () => void) => void) => {
    const { text, language, tone, isTranslate, } = params;
    let transDataPrompt = `You are a world class Translation Specialists.`

    const selectText = text ? `\n<text>\n${text}\n</text>` : '';

    transDataPrompt += `\n\n${selectText}`

    if (isTranslate) {
        transDataPrompt += `\n\nTranslate the text in XML tag <text></text> into ${language} language in a ${tone} tone,Translate strictly from the text without expanding it, retaining the original format,output result without tag.`
    }

    const result = await chatByPrompt(null, transDataPrompt, {
        temperature: 0.7,
        stream: true
    }, callback)
    return result?.content;
    // callback(true, { content: `$${text}$` }, () => void 0);
}


export const improveWriting = async (params: {
    text: string, language: string,
    tone: string,
    isTranslate?: boolean,
    expand?: boolean,
    emoji?: boolean,
    grammar?: boolean
}, callback?: (done: boolean, result: IChatResult, stop: () => void) => void) => {
    const { text, language, tone, isTranslate = false, expand = false, emoji = false, grammar = false } = params;
    let transDataPrompt = `You are a writer, You need to perform the following tasks and follow the rules to process the text entered by the user, and output result.`

    const rule = `
<RULES>
- If no language is specified, then use the same language of user input text
- Don't use double quotes for output`

    let task = '<TASKS>';

    if (isTranslate) {
        task += `\n- Translate the text into ${language} language with a ${tone} tone.`
    }
    if (expand) {
        task += `\n- Make the text user input longer.`
    }

    if (emoji) {
        task += `\n- Add appropriate emoji to the text.`
    }
    if (grammar) {
        task += `\n- Corrects grammatical and spelling errors.`
    }

    transDataPrompt += `\n\n${task}`

    transDataPrompt += `\n\n${rule}`

    transDataPrompt += `\n\nUSER INPUT:\n${text}`

    transDataPrompt += `\n\nOutput result directly, Don't output the task execution process.`;

    transDataPrompt += `\n\nOUTPUT:`;

    const result = await chatByPrompt('', transDataPrompt, {
        temperature: 0.5,
        stream: true
    }, callback)

    return result?.content;
    // callback(true, { content: `$${text}$` }, () => void 0);
}



