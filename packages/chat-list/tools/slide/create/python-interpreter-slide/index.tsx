/* eslint-disable no-inner-declarations */
import { ChatState, ITool } from "chat-list/types/plugin";
import instruction from './instruction.md';
import { arrayToMarkdownTable, buildChatMessage, extractCodeFromMd } from "chat-list/utils";
import { prepareFolder, runFunction, readFileToBase64, listFiles, initEnv, readFilesToData, readXlsxFileToJson, readCsvFileToJson, readFileToBase64Image, readFileToText, pipInstall } from 'chat-list/tools/sheet/python/util';
import CardDownloadFile from 'chat-list/components/card-download-from-python';
import image from 'chat-list/utils/image';
import CardFolder from 'chat-list/components/card-folder'
import slideApi from '@api/slide';
import React from "react";

/**
 * Code generation and run it in Python
 */
export const func = async ({ script, explain, context }: { script: string, explain: string, context: ChatState }) => {
    // const code = extractCodeFromMd(script);

    if (!script) {
        return `Sorry! I can't generate the script code`;
    }

    await pipInstall(['python-pptx'])
    const code = extractCodeFromMd(script);
    const resMsg = buildChatMessage(`${explain}\n\`\`\`python\n${code}\n\`\`\``, 'text');
    const { appendMsg, platform } = context;
    appendMsg(resMsg);

    // const wboutArrayBuffer = await createXlsxFile();
    // await prepareFolder(['/input'], false)

    await prepareFolder(['/output'], true);
    // await writeFile('/input/data.xlsx', wboutArrayBuffer);
    await runFunction(code, 'main');

    const outputFiles = await listFiles('/output');
    const homeFiles = await listFiles('/home/pyodide');
    const fileNames = outputFiles.concat(homeFiles);
    if (!fileNames || fileNames.length <= 0) {
        return 'Task failed!';
    }
    let summary = '';
    for (let i = 0; i < fileNames.length; i++) {
        const path = fileNames[i];
        const ext = path.split('.').pop();
        const name = path.split('/').pop();
        if (ext === 'pptx') {
            if (platform === 'google') {
                const outputFiles = await readFilesToData('/output', false);
                const homeFiles = await readFilesToData('/home/pyodide', false);
                const downMsg = buildChatMessage(<CardDownloadFile files={outputFiles.concat(homeFiles)} />, 'card', 'assistant');
                appendMsg(downMsg);
            }
            const data = await readFileToBase64(path, 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
            await slideApi.insertSlidesFromBase64(data)
            summary += 'Generating presentation task completed!';
        } else if (ext === 'xlsx') {
            const datas = await readXlsxFileToJson(path);
            const content = datas.map(({ name, data }) => {
                return `**${name}**\n\n${arrayToMarkdownTable(data)}`
            }).join('\n\n');
            summary += '\n\n' + content;
            const msg = buildChatMessage(content, 'text', 'assistant');
            appendMsg(msg)
        }
        else if (ext === 'csv') {
            const datas = await readCsvFileToJson(path);
            const content = datas.map(({ name, data }) => {
                return `**${name}**\n${arrayToMarkdownTable(data)}\n`
            }).join('\n');
            summary += '\n\n' + content;
            const msg = buildChatMessage(content, 'text', 'assistant');
            appendMsg(msg)
        }
        else if (ext === 'png' || ext == 'jpeg') {
            // render image
            const data = await readFileToBase64Image(path)
            const url = image.set(data as string, `python.chart/${name}`)
            const content = `**${name}**\n\n![${name}](${url})`;
            summary += '\n\n' + content;
            const msg = buildChatMessage(content, 'text', 'assistant');
            appendMsg(msg)

        } else if (ext === 'txt') {
            const content = await readFileToText(path)
            summary += '\n\n' + content;
        }
    }


    return summary;
}

export default {
    type: 'function',
    name: 'python_interpreter_slide',
    description: "Run Python to genderate Presentation.",
    parameters: {
        "type": "object",
        "properties": {
            "script": {
                "type": "string",
                "description": instruction
            },
            'explain': {
                "type": "string",
                "description": `Explain the python code`
            },
        },
        "required": ['script', 'explain']
    },
    func
} as unknown as ITool;
