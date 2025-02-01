import React, { useEffect, useState } from 'react';
import CodeEditor from 'chat-list/components/code-editor/python';
import sheetApi from '@api/sheet';
import { getSheetInfo, getValues } from 'chat-list/service/sheet';
import { editFunction, createFunction } from './util';
import { createXlsxFile, extractPackageNames, pipInstall, prepareFolder, runScript, writeFile } from 'chat-list/tools/sheet/python/util';

import { initEnv } from 'chat-list/tools/sheet/python/util';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from 'chat-list/lib/utils';
import Loading from 'chat-list/components/loading';

export default function PythonEditor({ code }: { code?: string }) {
    const [editorCode, setEditorCode] = useState(code || ''); // 初始化代码
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const { t } = useTranslation(['coder']);


    const navigate = useNavigate();
    const onCodeChange = (code: string) => {
        setEditorCode(code);
    };

    const onRun = async (code: string) => {
        const script = code.trim();
        if (script.startsWith('!') || script.startsWith('pip')) {
            // input is "!pip install numpy",write code to extract package name
            const packages = extractPackageNames(script);
            console.log('packages', packages);
            if (packages && packages.length > 0) {
                try {
                    await pipInstall(packages);
                    return `Install ${packages.join(', ')} successfully`;
                } catch (e) {
                    return e.message;
                }
            } else {
                return `No packages found in command.`;
            }
        }
        // await pushHistory();
        const result = await runScript(code);
        return result;
        // setExecutionResult(result);
    };
    const codeCompletion = async (code = '', input: string) => {
        // console.log(code, input)
        const sheetInfo = await getSheetInfo();
        if (!code.trim()) {
            return await createFunction(sheetInfo, input);
        } else {
            return await editFunction(sheetInfo, input, code);
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
    const onBack = () => {
        // navigate to back
        navigate(-1);
    };
    const initData = async () => {
        await prepareFolder(['/input', '/output'], false);

        const wboutArrayBuffer = await createXlsxFile();
        if (!wboutArrayBuffer) {
            return;
        }

        await writeFile('/input/data.xlsx', wboutArrayBuffer);
    };
    const init = async () => {
        setLoading(true);
        setMessage(t('init_python'));
        await initEnv();
        setMessage(t('prepare_data'));
        await initData();
        setLoading(false);
    };
    useEffect(() => {
        init();
    }, []);

    if (loading) {
        return (
            <div className={cn('flex flex-col items-center justify-center h-screen relative bg-white')}>
                <Loading className='h-8' />
                <span>
                    {message}
                </span>
            </div>
        );
    }
    return (
        <div className='flex flex-col w-full h-full'>
            <CodeEditor
                autoRun={false}
                code={editorCode}
                onChange={onCodeChange}
                onRun={onRun}
                codeCompletion={codeCompletion}
                className='flex-1 h-auto overflow-auto'
                onUndo={onUndo}
                hideChatbox={true}
            ></CodeEditor>
        </div>
    );
}
