import React, { useEffect, useState } from 'react'
import CodeEditorPc from 'chat-list/components/code-editor/python-pc';
import CodeEditor from 'chat-list/components/code-editor/python';
import sheetApi from '@api/sheet'
import { getSheetInfo, getValues } from 'chat-list/service/sheet';
import { editFunction, createFunction, } from './util';
import { pipInstall, runScript } from 'chat-list/tools/sheet/python/util';
import { createXlsxFile, initEnv, prepareFolder, writeFile, extractPackageNames } from 'chat-list/tools/sheet/python/util';
// import { getSessionStore } from 'chat-list/local/session';
import Loading from 'chat-list/components/loading';
import { cn } from 'chat-list/lib/utils';
import { useTranslation } from 'react-i18next'
import { isMobile } from 'chat-list/utils';
import Header from 'chat-list/components/header';
import { useNavigate } from 'react-router-dom'

// import Header from 'chat-list/components/header';
// import { useNavigate } from 'react-router-dom'
const mobile = isMobile();

export default function PythonEditor() {
    const [editorCode, setEditorCode] = useState(''); // 初始化代码
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [history, setHistory] = useState<any[]>([]);
    const { t } = useTranslation(['coder']);
    const navigate = useNavigate();

    const onCodeChange = (code: string) => {
        setEditorCode(code);
    };

    const onRun = async (code: string) => {
        // await pushHistory();
        const script = code.trim();
        if (script.startsWith('!') || script.startsWith('pip')) {
            // input is "!pip install numpy",write code to extract package name
            const packages = extractPackageNames(script);
            console.log('packages', packages)
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
        await initData();
        const result = await runScript(code);
        return result;
        // setExecutionResult(result);
    };
    const codeCompletion = async (code = '', input: string, callback: (done: boolean, code: string) => void) => {
        // console.log(code, input)
        const sheetInfo = await getSheetInfo();
        //         const result = `import pandas as pd
        // import matplotlib.pyplot as plt

        // def main():
        //     file_path = '/input/data.xlsx'
        //     df = pd.read_excel(file_path, sheet_name="Sheet193",header=1)

        //     # 数据处理
        //     df['销售额'] = df['销售额'].replace({'\$': '', ',': ''}, regex=True).astype(float)
        //     df_grouped = df.groupby('城市')['销售额'].sum()

        //     # 生成饼图
        //     plt.figure(figsize=(8, 8))
        //     plt.pie(df_grouped, labels=df_grouped.index, autopct='%1.1f%%', startangle=140)
        //     plt.title('销售额饼图')

        //     output_file = '/output/销售额饼图.png'
        //     plt.savefig(output_file)
        // `
        if (!code.trim()) {
            // if (callback) {

            //     callback(false, result)
            // }
            // return result;
            return await createFunction(sheetInfo, input, callback);
        } else {
            return await editFunction(sheetInfo, input, code, callback);
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
    }
    const pushHistory = async () => {
        const values = await getValues();
        setHistory(history.concat([values]));
    }
    const onBack = () => {
        // navigate to back
        navigate('/');
    }
    const initData = async () => {
        await prepareFolder(['/input', '/output'], true);

        const wboutArrayBuffer = await createXlsxFile();
        if (!wboutArrayBuffer) {
            return;
        }

        await writeFile('/input/data.xlsx', wboutArrayBuffer);
    }
    const init = async () => {
        setLoading(true);
        setMessage(t('init_python'));
        await initEnv()
        setMessage(t('prepare_data'));
        await initData();
        setLoading(false);
    }
    useEffect(() => {
        init();
    }, [])

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
        <div className='flex flex-col w-full h-screen '>
            <Header title='Jupyter' onBack={onBack} />
            {
                mobile && (
                    <CodeEditor
                        autoRun={false}
                        code={editorCode}
                        onChange={onCodeChange}
                        onRun={onRun}
                        codeCompletion={codeCompletion}
                        className='flex-1 h-auto overflow-auto'
                        onUndo={onUndo}
                    ></CodeEditor>
                )
            }
            {
                !mobile && (
                    <CodeEditorPc
                        autoRun={false}
                        code={editorCode}
                        onChange={onCodeChange}
                        onRun={onRun}
                        codeCompletion={codeCompletion}
                        className='flex-1 h-auto overflow-auto'
                        onUndo={onUndo}
                    ></CodeEditorPc>
                )
            }
        </div>
    );
}
