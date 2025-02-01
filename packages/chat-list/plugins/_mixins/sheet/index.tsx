import { base64ToFile, buildChatMessage, extractCodeFromMd, extractJsonDataFromMd, isEmpty, parseCellAddress, snakeToWords, template } from "chat-list/utils";
import { getValues } from "chat-list/service/sheet";
import React from "react";
import { chatByTemplate, chatWithImage } from "chat-list/service/message";
import CardTable from 'chat-list/components/card-data-table';
import screenshotPrompt from './prompts/screenshot.md';
import screenshotSheetInfoPrompt from './prompts/screenshot_sheetinfo.md';

import sheetApi from '@api/sheet';
import { ChatState } from "chat-list/types/plugin";
import understandPrompt from './prompts/understand.md';
import intendPrompt from './prompts/intend.md';
import introducePrompt from './prompts/introduce.md';
import { ISheetInfo } from "chat-list/types/api/sheet";
import CardConfirm from 'chat-list/components/card-confirm';
import i18n from 'chat-list/locales/i18n';

export const dataRangeAnalyzeMixin = {
    isSelectedRange: function (address: string) {

        if (!address.includes(':')) {
            return false;
        }
        let addr = address;
        if (address.includes('!')) {
            addr = address.split('!')[1];
        }
        const [start, end] = addr.split(':');
        const startPosition = parseCellAddress(start);
        const endPosition = parseCellAddress(end);

        if (endPosition.row - startPosition.row > 0) {
            return true;
        }
        if (endPosition.column - startPosition.column > 0) {
            return true;
        }
        return false;

    },
    getTableImage: async function (sheetInfo: ISheetInfo): Promise<{ file: File, address: string, sheetName: string }> {
        const { appendMsg } = this.context;

        const currentSheet = sheetInfo.sheetInfo.find(p => p.sheetName == sheetInfo.current);
        const address = currentSheet.dataRangeCells;
        const originValues = await getValues(5, currentSheet.sheetName);
        if (isEmpty(originValues)) {
            return;
        }
        // console.log(values)
        // 从originValues去前8列数据
        let addr = address;
        if (address.includes('!')) {
            addr = address.split('!')[1];
        }
        const start = parseCellAddress(addr.split(':')[0]);
        // const end = parseCellAddress(address.split(':')[1]);
        // console.log(start)
        const range = { row: start.row, column: start.column };
        let row = 1, column = 1;
        if (range) {
            row = range.row;
            column = range.column;
        }

        const values = originValues.map(p => p.slice(0, column + 5));

        const valColMax = Math.max(...values.map(p => p.length));

        const rowNum = row + values.length - 1;
        const colNum = column + valColMax;
        const fullValues = Array.from({ length: rowNum }, () => new Array(colNum).fill(null));
        for (let i = 0; i < values.length; i++) {
            for (let j = 0; j < values[i].length; j++) {
                const r = i + row - 1;
                const c = j + column - 1;
                fullValues[r][c] = values[i][j];
            }
        }

        return new Promise((resolve) => {
            appendMsg(this.buildChatMessage(
                <CardTable
                    sheetName={currentSheet.sheetName}
                    dataRange={currentSheet.dataRangeCells}
                    values={fullValues}
                    onScreenshot={async (base64) => {
                        // console.log(base64)
                        const file = await base64ToFile(base64, 'screenshot.png');
                        await resolve({ file, address, sheetName: currentSheet.sheetName });
                    }} />
                , 'card', '', 'assistant'));
        })
    },
    /**
     * use in add-on
     * @param input 
     * @returns 
     */
    analyzeDataRange: async function (input: string) {
        const { setTyping, appendMsg, updateMsg } = this.context;
        let isAppend = false;
        const sheetInfo = await sheetApi.getSheetInfo();
        const activeRange = sheetInfo.activeRange;
        if (this.isSelectedRange(activeRange)) {
            return;
        }
        const tableInfo = await this.getTableImage(sheetInfo);
        if (tableInfo) {
            const { file, address, sheetName } = tableInfo;
            const prompt = template(screenshotPrompt, {
                address,
                sheetName,
                input
            })
            setTyping(true);
            const newMsg = buildChatMessage('', 'text', 'assistant');
            await chatWithImage(file, prompt, async (done, result) => {
                if (!result.content) {
                    return;
                }
                if (!isAppend) {
                    newMsg.content = result.content;
                    appendMsg(newMsg);
                    isAppend = true;
                } else {
                    newMsg.content = result.content;
                    updateMsg(newMsg._id, newMsg)
                }
                if (done) {
                    newMsg.content = result.content;
                    const addr = extractCodeFromMd(result.content);

                    await sheetApi.activeSheet(sheetName, addr.replace(/[\r\n]/g, ''));
                    updateMsg(newMsg._id, newMsg)
                }
            })
        }
    },
    /**
     * use in PC
     * @param input 
     * @returns 
     */
    analyzeSheetInfo: async function (input: string): Promise<string> {
        const { setTyping, appendMsg, updateMsg } = this.context;

        const sheetInfo = await sheetApi.getSheetInfo();

        let isAppend = false;
        const tableInfo = await this.getTableImage(sheetInfo);
        if (tableInfo) {
            const { file, address, sheetName } = tableInfo;
            const prompt = template(screenshotSheetInfoPrompt, {
                address,
                sheetName,
                input
            });
            setTyping(true);
            const newMsg = buildChatMessage('', 'text', 'assistant');
            return new Promise((resolve) => {
                chatWithImage(file, prompt, async (done, result) => {
                    if (!result.content) {
                        return;
                    }
                    if (!isAppend) {
                        newMsg.content = result.content;
                        appendMsg(newMsg);
                        isAppend = true;
                    } else {
                        newMsg.content = result.content;
                        updateMsg(newMsg._id, newMsg)
                    }
                    if (done) {
                        newMsg.content = result.content;
                        updateMsg(newMsg._id, newMsg)
                        resolve(result.content)
                    }
                })
            })
        }
    },
    showSheetInfo: async function (message: any) {
        const { setTyping, appendMsg, deleteMsg, newChat, sendMsg, updateMsg, agentTools, tools, platform } = this.context as ChatState;
        setTyping(true);
        const intend = await this.analyzeIntend(message);
        if (intend == '1' || intend == '2') {
            await this.introduceCapabilities(message);
            return;
        }
        let sheetInfo;
        if (message.context) {
            sheetInfo = JSON.parse(message.context);
        } else {
            sheetInfo = await sheetApi.getSheetInfo();
        }
        if (sheetInfo) {
            const activeRange = sheetInfo.activeRange;
            // if (!this.isSelectedRange(activeRange)) {
            // const addr = await sheetApi.getRangeA1Notation()
            await sheetApi.activeSheet(sheetInfo.current, activeRange);
            // }
            // console.log('isSelectedRange', this.isSelectedRange(activeRange))
            const toolList = agentTools.map((item) => {
                const tool = tools.find(p => p.name == item.id);
                // return { name: snakeToWords(tool.name), description: tool.description }
                return `tool_name:${snakeToWords(tool.name)}\ntool_description:\n"""\n${tool.description}\n"""`
            })
            this.push({ role: 'user', content: (message.context || '') + '\n\n' + message.content })
            const newMsg = this.buildChatMessage('', 'text', message.to, 'assistant');
            let isAppend = false;
            const understand = understandPrompt;
            const result = await chatByTemplate(understand, {
                input: message.content,
                sheet_info: JSON.stringify(sheetInfo, null, 2),
                tool_list: toolList.join('\n\n'),
                language: (message.content as string).substring(0, 2)
            }, { stream: true }, (done, result) => {
                if (!result.content) {
                    return;
                }
                if (!isAppend) {
                    isAppend = true;
                    newMsg.content = result.content;
                    appendMsg(newMsg)
                } else {
                    newMsg.content = result.content;
                    updateMsg(newMsg._id, newMsg);
                }
            })
            this.push({ role: 'assistant', content: result.content })
            const confirmMsg = buildChatMessage(
                <CardConfirm content=""
                    okText={i18n.t('base:common.confirm', "Confirm")}
                    onOk={() => {
                        sendMsg(buildChatMessage(i18n.t('base:common.yes', "Yes"), 'text', 'user'))
                        setTimeout(() => {
                            deleteMsg(confirmMsg._id)
                        }, 500);
                    }}
                    cancelText={i18n.t('base:common.reslect_and_confirm', "Reselect and Confirm")}
                    onCancel={() => {
                        newChat();
                        this.showSheetInfo(message);
                    }}
                />, 'card', 'user')
            appendMsg(confirmMsg)
            return;
        }
    },
    /**
     * 
     * @param message 
     * @returns 1:say hello,2:ask capabilities,3:ask questions about sheet
     */
    analyzeIntend: async function (message: any): Promise<'1' | '2' | '3'> {
        const res = await chatByTemplate(intendPrompt, {
            input: message.content
        }, {
            stream: false,
            // response_format: {
            //     type: "json_object"
            // }
        })
        const result = extractJsonDataFromMd(res.content) as { type: '1' | '2' | '3' }
        if (result) {
            return result.type;
        }
        return '3'
    },
    introduceCapabilities: async function (message: any) {
        const { appendMsg, updateMsg, agentTools, tools } = this.context as ChatState;
        const toolList = agentTools.map((item) => {
            const tool = tools.find(p => p.name == item.id);
            return { name: snakeToWords(tool.name), description: tool.description }
        })
        const newMsg = this.buildChatMessage('', 'text', message.to, 'assistant');
        let isAppend = false;
        await chatByTemplate(introducePrompt, {
            input: message.content,
            tool_list: JSON.stringify(toolList, null, 2),
            language: (message.content as string).substring(0, 2)
        },
            { stream: true },
            (done, result) => {
                if (!result.content) {
                    return;
                }
                if (!isAppend) {
                    isAppend = true;
                    newMsg.content = result.content;
                    appendMsg(newMsg)
                } else {
                    newMsg.content = result.content;
                    updateMsg(newMsg._id, newMsg);
                }
            }
        )
    }
}