import { ChatContext } from 'chat-list/store/chatContext';
import React, { useContext, useEffect, useState } from 'react';
import CodeEditor from 'chat-list/components/code-editor/mark';
import { getValues } from 'chat-list/service/sheet';
import Markdown from 'chat-list/components/markdown';
// import uml from './prompts/uml.md'
import { editFunction } from './edit';
import docApi from '@api/doc';
import Loading from '../loading';
import ErrorBoundary from 'chat-list/components/error-boundary';

export default function CoderRender() {
    const { plugin, chat } = useContext(ChatContext);
    const [editorCode, setEditorCode] = useState(''); // 初始化代码
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const onCodeChange = (code: string) => {
        console.log(code);
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

        // const result = await sheetApi.runScript(code);
        // return result;
        // setExecutionResult(result);
    };
    const codeCompletion = async (code: string, input: string) => {
        console.log(code, input);
        return await editFunction(code, input);
    };
    const onUndo = async () => {
        // if (history.length === 0) {
        //     return;
        // }
        // const data = history[history.length - 1];
        // await sheetApi.setValues(data);
        // const newHistory = history.slice(0, history.length - 1);
        // setHistory(newHistory);
        // console.log('undo')
    };
    const pushHistory = async () => {
        const values = await getValues();
        setHistory(history.concat([values]));
    };
    const renderPerview = (code: string) => {
        return (
            <ErrorBoundary>
                <Markdown copyContentBtn={false}>
                    {code}
                </Markdown>
            </ErrorBoundary>
        );
    };

    const initCode = async () => {
        try {
            setLoading(true);
            if (plugin.code) {
                setEditorCode(plugin.code);
                plugin.code = '';
                return;
            }
            const info = await docApi.getSelectedImageInfo();
            if (info) {
                const { title, description } = info;
                if (title.includes('mermaid')) {
                    setEditorCode("```mermaid\n" + description + "\n```");
                }
                return;
            }

            const text = await docApi.getSelectedText();
            if (!text) {
                return;
            }
            const result = await editFunction('', text);
            setEditorCode(result);
            setLoading(false);
        } finally {
            setLoading(false);
        }

    };

    useEffect(() => {
        initCode();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <Loading />
            </div>
        );
    }
    return (
        <CodeEditor
            autoRun={false}
            code={editorCode}
            onChange={onCodeChange}
            onRun={onRun}
            codeCompletion={codeCompletion}
            className='h-full'
            onUndo={onUndo}
            renderPerview={renderPerview}
        ></CodeEditor>
    );
}
