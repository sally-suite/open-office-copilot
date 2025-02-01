import React, { useEffect, useMemo, useState } from 'react'
import { Check, ChevronUp, Copy, Edit, FileOutput, Play, } from 'lucide-react';
import IconButton from 'chat-list/components/icon-button'

import { buildChatMessage, copyByClipboard } from 'chat-list/utils';

import { cn } from 'chat-list/lib/utils';
import { useTranslation } from 'react-i18next';
import { setSessionStore } from 'chat-list/local/session';
import { useNavigate } from 'react-router-dom'
// import rehypeSanitize from 'rehype-sanitize'
import { runFunction } from 'chat-list/tools/sheet/python/util';
import useChatState from 'chat-list/hook/useChatState';
import CodePreview from 'chat-list/components/code-preview';
import sheetApi from '@api/sheet';
import slideApi from '@api/slide';
import docApi from '@api/doc';

export const Code = (props: any) => {
    const { children, } = props;
    const codeProps = children[0].props;
    const script: string = codeProps.children[0];

    const lng = useMemo(() => {
        const codeClass = codeProps.className;
        const match = /language-(\w+)/.exec(codeClass || '')
        const lng = match ? match[1] : '';
        return lng;
    }, [])
    const { docType, appendMsg, status, setPreview } = useChatState();
    const [copyOk, setCopyOk] = React.useState(false);
    const [running, setRunning] = useState(false);
    const [generateing, setGenerateing] = useState(false);
    const [language, setLanguage] = useState(lng);
    const [expand, setExpand] = useState(false);
    const { t } = useTranslation();
    const navigate = useNavigate();

    const isFunction = language === 'javascript' || language === 'python';
    const onRun = async () => {
        try {
            setRunning(true);

            let result;
            if (language === 'python') {
                result = await runFunction(script, 'main')
            } else {
                if (docType === 'sheet') {
                    result = await sheetApi.runScript(script);
                } else if (docType === 'doc') {
                    result = await docApi.runScript(script);
                }
            }
            // const result = await sheetApi.runScript(script);
            if (result) {
                appendMsg(buildChatMessage(`Script run result:${JSON.stringify(result)}.`, 'text', 'assistant'))
            } else {
                appendMsg(buildChatMessage(`Script run finished.`, 'text', 'assistant'))
            }

        } catch (e) {
            if (e) {
                appendMsg(buildChatMessage(`Exception: ${e.message}`, 'text', 'assistant'))
            }
        } finally {
            setRunning(false);
        }
    }
    const onEdit = () => {
        // setValue(script);
        //通过正则，判断script的语言类型,是JavaScript，还是python
        // const language = script.match(/^#!.*?\s(.*?)$/m);
        // const languageType = language ? language[1] : 'javascript';

        let target = '';
        if (!language || language === 'javascript') {
            target = 'javascript';
        } else if (language === 'python') {
            target = 'python'
        }
        // web page show preview
        if (docType == 'chat') {
            if (target == 'python') {
                setPreview({
                    title: 'Python',
                    component: (
                        <CodePreview key={script} code={script} />
                    )
                })
            }
            return;
        }

        if (target == 'python') {
            setSessionStore('python-code', script);
            navigate('/python-editor');
            return;
        } else if (target == 'javascript') {
            setSessionStore('javascript-code', script);
            navigate('/javascript-editor');
            return;
        }
        // const plg = plugins.find(p => p.action == target);
        // plg.code = script;
        // setMode('custom');
        // setPlugin(plg)

    }
    const onInsertCell = async () => {
        if (docType === 'sheet') {
            await sheetApi.insertText(script);
        } else if (docType == 'doc') {
            await docApi.insertText(script);
        } else if (docType == 'slide') {
            await slideApi.insertText(script);
        } else {
            await docApi.insertText(script, { type: 'text' });
        }
    };
    const handleClick = async () => {

        // console.log(html)
        await copyByClipboard(script, `<pre>${script}</pre>`);
        setCopyOk(true);
        setTimeout(() => {
            setCopyOk(false);
        }, 1000);
    };
    const toogleExpand = () => {
        setExpand(!expand);

    }
    // if (!copyCodeBtn) {
    //     return <pre className='bg-slate-700 p-1'>{children}</pre>;
    // }
    const insertTitle = useMemo(() => {
        let tip = '';
        if (docType === 'doc') {
            tip = t('common.insert_to_doc');
        } else if (docType == 'sheet') {
            tip = t('common.insert_to_sheet');
        }
        return tip;
    }, [])
    const init = () => {
        const { children, } = props;
        const codeProps = children[0].props;
        const codeClass = codeProps.className;
        const match = /language-(\w+)/.exec(codeClass || '')
        const language = match ? match[1] : '';
        setLanguage(language);
        if (!language || language == 'bash') {
            setExpand(true);
        }
    }

    const renderTopbar = () => {
        return (
            <div className='flex flex-row '>
                {
                    isFunction && (
                        <>
                            <IconButton
                                disabled={status === 'processing'}
                                loading={running}
                                // title={status === 'processing' ? "Processing" : `Run code`}
                                onClick={onRun}
                                className={cn('h-5 w-5 bg-transparent hover:bg-transparent text-slate-200 text-[10px]', running ? "w-auto px-1" : "")}
                                icon={Play}
                            >
                                {
                                    running && t('common.running')
                                }
                            </IconButton>
                            <IconButton
                                // title={t('common.edit')}
                                onClick={onEdit}
                                className='h-5 w-5 ml-1 bg-transparent hover:bg-transparent text-slate-200'
                                icon={Edit}
                            >
                            </IconButton>
                        </>
                    )
                }
                <IconButton
                    // title={t('common.copy')}
                    onClick={handleClick}
                    className='h-5 w-5 ml-1 bg-transparent hover:bg-transparent text-slate-200'
                    icon={(
                        copyOk ? Check : Copy
                    )}
                >
                </IconButton>
            </div>
        )
    }
    const renderToolbar = () => {
        return (
            <div className='flex flex-row mt-1 '>
                {
                    (isFunction && docType !== 'side') && (
                        <>
                            <IconButton
                                disabled={status === 'processing'}
                                loading={running}
                                // title={status === 'processing' ? "Processing" : `Run code`}
                                onClick={onRun}
                                className={' w-auto px-1 py-3 mr-1'}
                                icon={Play}
                            >
                                {
                                    running && t('common.running')
                                }
                                {
                                    !running && t('common.run')
                                }
                            </IconButton>
                            <IconButton
                                onClick={onEdit}
                                className=' w-auto mr-1 px-1 py-3 '
                                icon={Edit}
                            >
                                {t('common.edit')}
                            </IconButton>
                        </>
                    )
                }

                <IconButton
                    onClick={handleClick}
                    className=' w-auto px-1 py-3 mr-1'
                    icon={(
                        copyOk ? Check : Copy
                    )}
                >
                    {t('common.copy')}
                </IconButton>
                {
                    docType !== 'chat' && (
                        <IconButton
                            title={insertTitle}
                            onClick={onInsertCell}
                            className=' w-auto mr-1 px-1 py-3 '
                            icon={FileOutput}
                        >
                            {t('common.insert')}
                        </IconButton>
                    )
                }
                {/* <IconButton
                    title="Star"
                    onClick={handleClick}
                    className=' w-auto px-1 py-3 mr-1'
                    icon={(
                        copyOk ? Check : Copy
                    )}
                >
                    Save
                </IconButton> */}
            </div>
        )
    }

    useEffect(() => {
        init();
    }, [])

    return (
        <div
            className="relative py-2 rounded"
            style={{
                width: 'auto'
            }}
        >
            <pre className='bg-slate-700 p-1 rounded'>
                <div className='flex flex-row justify-between'>
                    <div className='flex flex-row items-center flex-1 cursor-pointer ' onClick={toogleExpand}>
                        <span className=' h-5 w-5 border border-slate-200 rounded-[4px] flex justify-center items-center ' >
                            {
                                <ChevronUp className={cn('text-slate-200 transition-transform ', expand ? "rotate-180" : "")} />
                            }
                        </span>
                        <span className='text-slate-200 ml-1'>
                            {language || t('common.code')}
                        </span>
                    </div>
                    {
                        renderTopbar()
                    }
                </div>
                {/* {
                    expand && (
                        <code>
                            {children[0].props.children}
                        </code>
                    )
                } */}
                <div className=' transition-all overflow-auto' style={{
                    height: expand ? 'auto' : '0'
                }}>
                    <code>
                        {children[0].props.children}
                    </code>
                </div>
            </pre>
            {
                expand && renderToolbar()
            }
        </div>
    );
};

export default Code;