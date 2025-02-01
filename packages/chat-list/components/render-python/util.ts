import { arrayToMarkdownTable, buildChatMessage, extractCodeFromMd, template } from 'chat-list/utils'
import updatePrompt from './prompts/update.md'
import createPrompt from './prompts/create.md'

import { chat } from 'chat-list/service/message'
import { IMessageBody } from 'chat-list/types/chat'
import { initEnv, writeFile, createXlsxFile, prepareFolder, runFunction, listFiles, readXlsxFileToJson, readFileToBase64Image, runFunctionWithLog } from 'chat-list/tools/sheet/python/util'
import image from 'chat-list/utils/image'

export const editFunction = async (sheetInfo: string, input: string) => {
    const prompt = template(createPrompt, {
        sheetInfo,
    })
    const context: IMessageBody = {
        role: 'system',
        content: prompt
    }
    const result = await chat({
        messages: [
            context,
            {
                role: 'user',
                content: `User requirement:${input}`
            }
        ],
        temperature: 0.5
    })
    return extractCodeFromMd(result.content)
}

export const createFunction = async (sheetInfo: string, input: string, oldCode: string) => {
    const prompt = template(createPrompt, {
        code: oldCode,
        sheetInfo,
    })
    const context: IMessageBody = {
        role: 'system',
        content: prompt
    }
    const result = await chat({
        messages: [
            context,
            {
                role: 'user',
                content: `User requirement:${input}`
            }
        ],
        temperature: 0.5
    })
    return extractCodeFromMd(result.content)
}

export const runScript = async (script: string) => {
    try {
        const pyodide = await initEnv();
        // let wboutArrayBuffer

        // if (window.INPUT_EXCEL_FILE) {
        //     // 把 File 转成 ArrayBuffer
        //     const buffer = await window.INPUT_EXCEL_FILE.arrayBuffer();
        //     wboutArrayBuffer = new Uint8Array(buffer)
        // } else {
        //     wboutArrayBuffer = await createXlsxFile();
        // }
        // await prepareFolder(['/input', '/output'], false)
        // await writeFile('/input/data.xlsx', wboutArrayBuffer);
        const result = await runFunction(script, 'main');
        // debugger;
        const fileNames = await listFiles('/output');
        if (!fileNames || fileNames.length <= 0) {
            return result;
        }
        // JavaScript 从文件系统中读取修改后的文件
        for (let i = 0; i < fileNames.length; i++) {
            const path = fileNames[i];
            const matchResult = /\/?([^/]+)(?=\.\w+$)/.exec(path);
            const fileName = matchResult ? matchResult[1] : path;
            const ext = path.split('.').pop();

            if (ext === 'xlsx') {
                const datas = await readXlsxFileToJson(path);
                const markTable = datas.map(({ data }) => {
                    return `${arrayToMarkdownTable(data)}`
                }).join('\n');

                return `${result}\n${markTable}`;
            } else if (ext === 'png' || ext == 'jpeg') {
                // render image
                const base64Image = await readFileToBase64Image(path)
                const url = image.set(base64Image)
                const msg = `${result}\n\n${fileName}\n![${fileName}](${url})`;

                return msg;

            } else if (ext === 'txt') {
                const modifiedFileData = pyodide.FS.readFile(path, { encoding: "binary" });
                const text = new TextDecoder("utf-8").decode(modifiedFileData);
                return `${result}\n\n${text}`;
            }
        }

    } catch (e) {
        console.error(e);
        return `Script run failed, Exception:${e.message}`;
    }
}