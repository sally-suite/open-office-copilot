import React, { useState } from 'react';
import CodeEditor from 'chat-list/components/code-editor';
import sheetApi from '@api/sheet';
import { getSheetInfo, getValues } from 'chat-list/service/sheet';

// import { extractCodeFromMd } from 'chat-list/utils'
// import functionEditPrompt from './prompts/v1.md'
// import { IMessageBody } from 'chat-list/types/chat'
import { editFunction } from './edit';
import { getSessionStore } from 'chat-list/local/session';
import Header from 'chat-list/components/header';
import { useNavigate } from 'react-router-dom';

export default function CoderRender() {
    const [editorCode, setEditorCode] = useState(getSessionStore('javascript-code') || ''); // 初始化代码
    const [history, setHistory] = useState<any[]>([]);
    const navigate = useNavigate();
    const onCodeChange = (code: string) => {
        setEditorCode(code);
    };
    const onRun = async (code: string) => {
        await pushHistory();
        const result = await sheetApi.runScript(code);
        return result;
        // setExecutionResult(result);
    };
    const codeCompletion = async (code: string, input: string) => {
        console.log(code, input);
        const sheetInfo = await getSheetInfo();
        return await editFunction(sheetInfo, input);
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
    const onBack = () => {
        navigate('/');
    };
    return (
        <div className='flex flex-col w-full h-screen'>
            <Header title='Javascript' onBack={onBack} />
            <CodeEditor
                autoRun={false}
                code={editorCode}
                onChange={onCodeChange}
                onRun={onRun}
                codeCompletion={codeCompletion}
                className='flex-1 h-auto overflow-auto'
                onUndo={onUndo}
            ></CodeEditor>
        </div>
    );
}
