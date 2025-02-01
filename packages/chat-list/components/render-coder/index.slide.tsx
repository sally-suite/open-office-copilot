import { ChatContext } from 'chat-list/store/chatContext';
import React, { useContext, useState } from 'react';
import CodeEditor from 'chat-list/components/code-editor';
import slideApi from '@api/slide';

// import { extractCodeFromMd } from 'chat-list/utils'
// import functionEditPrompt from './prompts/v1.md'
// import { IMessageBody } from 'chat-list/types/chat'
import { editFunction } from './edit';

export default function CoderRender() {
    const { plugin, chat } = useContext(ChatContext);
    const [editorCode, setEditorCode] = useState(plugin.code); // 初始化代码
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
        const result = await slideApi.runScript(code);
        return result;
        // setExecutionResult(result);
    };

    const codeCompletion = async (code: string, input: string) => {
        // console.log(code, input)
        // const sheetInfo = await getSheetInfo();
        // return await editFunction(sheetInfo, input);
    };

    const onUndo = async () => {
        return;
    };


    return (
        <CodeEditor
            autoRun={false}
            code={editorCode}
            onChange={onCodeChange}
            onRun={onRun}
            codeCompletion={codeCompletion}
            className='h-full'
            onUndo={onUndo}
        ></CodeEditor>
    );
}
