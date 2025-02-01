import { ChatContext } from 'chat-list/store/chatContext';
import React, { useContext, useEffect, useState } from 'react';
import CodeEditor from 'chat-list/components/code-editor/python';
import sheetApi from '@api/sheet';
import { getSheetInfo, getValues } from 'chat-list/service/sheet';
import { editFunction, createFunction, runScript } from './util';

import { initEnv } from 'chat-list/tools/sheet/python/util';

export default function CoderRender() {
    const { plugin, chat } = useContext(ChatContext);
    const [editorCode, setEditorCode] = useState(plugin.code); // 初始化代码
    const [history, setHistory] = useState<any[]>([]);
    const onCodeChange = (code: string) => {
        setEditorCode(code);
    };
    // const editFunction = async (sheetInfo: string, input: string) => {
    //     const context: IMessageBody = {
    //         role: 'system',
    //         content: functionEditPrompt + '\n' + sheetInfo
    //     }
    //     const result = await chat({
    //         messages: [
    //             context,
    //             {
    //                 role: 'user',
    //                 content: `User requirement:${input}`
    //             }
    //         ],
    //         temperature: 0.5
    //     })
    //     return extractCodeFromMd(result.content)
    // }

    const onRun = async (code: string) => {
        await pushHistory();
        const result = await runScript(code);
        return result;
        // setExecutionResult(result);
    };
    const codeCompletion = async (code: string, input: string) => {
        // console.log(code, input)
        const sheetInfo = await getSheetInfo();
        if (!code) {
            return await createFunction(sheetInfo, input, code);
        } else {
            return await editFunction(sheetInfo, input);
        }

    };
    const onUndo = async () => {
        if (history.length === 0) {
            return;
        }
        const data = history[history.length - 1];
        await sheetApi.setValues(data);
        const newHistory = history.slice(0, history.length - 1);
        setHistory(newHistory);
        // console.log('undo')
    };
    const pushHistory = async () => {
        const values = await getValues();
        setHistory(history.concat([values]));
    };

    useEffect(() => {
        initEnv();
    }, []);
    return (
        <CodeEditor
            autoRun={true}
            code={editorCode}
            onChange={onCodeChange}
            onRun={onRun}
            codeCompletion={codeCompletion}
            className='h-full'
            onUndo={onUndo}
        ></CodeEditor>
    );
}
