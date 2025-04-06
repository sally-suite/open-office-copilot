/* eslint-disable no-inner-declarations */
import { ChatState, ITool } from "chat-list/types/plugin";
import instruction from './instruction.md';
import { buildChatMessage, extractCodeFromMd } from "chat-list/utils";
import { createXlsxFile, prepareFolder, writeFile, runFunction, readFilesToData, convertFileToMark, prepareFont, readFileToBase64 } from '../util';
import React from "react";
import sheetApi from '@api/sheet';
import slideApi from '@api/slide';

import CardFolder, { FolderList } from 'chat-list/components/card-folder';
import i18n from 'chat-list/locales/i18n';

/**
 * Code generation and run it in Python
 */
export const func = async ({ active_sheet, script, output_files, explain, context }: { active_sheet: string, script: string, output_files: string[], explain: string, context: ChatState }) => {
    // const code = extractCodeFromMd(script);
    console.log('output_files', output_files);
    if (!script) {
        return `Sorry! I can't generate the script code`;
    }
    const { appendMsg, docType, platform, setPreview, user } = context;
    const code = extractCodeFromMd(script);
    const resMsg = buildChatMessage(`${explain}\n\`\`\`python\n${code}\n\`\`\``, 'text');
    appendMsg(resMsg);

    // let wboutArrayBuffer
    // if (window.INPUT_EXCEL_FILE) {
    //     // 把 File 转成 ArrayBuffer
    //     const buffer = await window.INPUT_EXCEL_FILE.arrayBuffer();
    //     wboutArrayBuffer = new Uint8Array(buffer)
    // } else {
    //     wboutArrayBuffer = await createXlsxFile();
    // }

    const wboutArrayBuffer = await createXlsxFile();

    await prepareFolder(['/input'], false);
    await prepareFolder(['/output'], false);
    await writeFile('/input/data.xlsx', wboutArrayBuffer);
    await prepareFont(i18n.resolvedLanguage);
    const result = await runFunction(code, 'main');
    const fileData = await readFilesToData('/output');
    console.log('output', fileData);
    // await updateFileToSheet(active_sheet, fileData);
    const fileContents = await convertFileToMark(fileData);
    console.log('fileContents', fileContents);
    if (!fileContents || fileContents.length <= 0) {
        return `Script run completed, here is execution result:\n\n${result}`;
    }
    let summary = 'Script run completed';
    for (let i = 0; i < fileContents.length; i++) {
        const { type, content, data, path, name } = fileContents[i];
        // console.log(type, path, name);
        // if (!output_files.includes(`${name}.${type}`)) {
        //     continue;
        // }
        const exist = output_files.some((fileName) => {
            if (fileName.startsWith('/output')) {
                if (fileName == path) {
                    return true;
                }
            } else {
                if (fileName == `${name}.${type}`) {
                    return true;
                }
            }
            return false;
        });
        if (!exist) {
            continue;
        }
        if (content) {
            const resMsg = buildChatMessage(`${content}`, 'text');
            appendMsg(resMsg);
        }
        if (type == 'pptx') {
            const data = await readFileToBase64(path, 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
            // console.log('pptdata', data)
            await slideApi.insertSlidesFromBase64(data);
            summary += 'Generating presentation task completed!';
        } else if (type == 'xlsx') {
            // display a card to show download link
            // if (docType === 'sheet' && platform == 'google') {
            //     const files = await readFilesToData('/output', false);
            //     const downMsg = buildChatMessage(<CardDownloadFile files={files} />, 'card', 'assistant');
            //     appendMsg(downMsg);
            // } else {

            // }
            for await (const file of data) {
                const { name } = file;
                if (file?.data && file?.data.length > 0 && file?.data[0].length > 0) {
                    const n = await sheetApi.initSheet(name);
                    await sheetApi.setValues(file?.data || [], n);
                }
            }
            summary += `\n\nTask completed. Let the user check the new sheet I created, or click the insert button to insert the data into a new sheet, or download it from the Folder.`;
        } else {
            summary += `\n\nTask completed, result is:\n\n ${content}`;
        }
    }
    if (fileData.length > 0) {
        if (docType == 'chat') {
            setPreview({
                title: i18n.t('coder:folder', 'Folder'),
                component: (
                    <FolderList folders={['/output']} expand={true} />
                )
            });
        } else {
            const folderMsg = buildChatMessage(<CardFolder folders={['/output']} />, 'card', 'assistant');
            appendMsg(folderMsg);
        }

    }
    return summary;
};

export default {
    type: 'function',
    name: 'python_interpreter',
    description: "Run Python to analyze your spreadsheet or do other works.",
    parameters: {
        "type": "object",
        "properties": {
            "active_sheet": {
                "type": "string",
                "description": "Active sheet name",
            },
            "script": {
                "type": "string",
                "description": instruction
            },
            'explain': {
                "type": "string",
                "description": `Explain the python code using user's language`
            },
            'output_files': {
                "type": "array",
                "description": "Output files of the script",
                "items": {
                    "type": "string",
                    "description": "Output only file name, not include path"
                }
            }
        },
        "required": ["active_sheet", 'script', 'explain', 'output_files']
    },
    func
} as unknown as ITool;
