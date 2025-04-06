import useChatState from 'chat-list/hook/useChatState';
import React, { useMemo, useState } from 'react';
import { cn } from 'chat-list/lib/utils';

import CardTranslate from 'chat-list/components/card-translate-doc';
import promptSetting from 'chat-list/service/writing/prompt';
import api from '@api/doc';
// import SallyAvatar from 'chat-list/components/avatars/sally'


import { useTranslation } from 'react-i18next';
import Button from '../button';
import Markdown from '../markdown';

function TranslateCard() {
    const [text, setText] = useState('');
    return (
        <>
            <CardTranslate
                onTranslate={(text) => {
                    setText(text);
                }}
            />
            <p className='mt-1 text-sm'>
                {text}
            </p>
        </>

    );
}

export default function ToolsRender({ className = '' }: { className: string }) {
    const { plugin, messages, resetList, chat } = useChatState();

    const { t } = useTranslation(['base']);
    const [result, setResult] = useState<any>('');
    const tooList = useMemo(() => {
        return [
            {
                code: 'translate',
                name: t('doc.translate', 'Translate'),
                tip: t('doc.tip.translate', 'Translate selected text'),
                icon: 'translate',
            },
            {
                code: 'summarize',
                name: t('doc.summarize', 'Summarize'),
                tip: t('doc.tip.summarize', 'Summarize selected text'),
                icon: '',
            },
            {
                code: 'optimize',
                name: t('doc.optimize', 'Optimize'),
                tip: t('doc.tip.optimize', 'Optimize selected text'),
                icon: '',
            },
            {
                code: 'contine_write',
                name: t('doc.contine_write', 'Contine writing'),
                tip: t('doc.tip.contine_writ', 'Contine write selected text'),
                icon: '',
            },
            {
                code: 'make_longer',
                name: t('doc.make_longer', 'Make longer'),
                tip: t('doc.tip.make_longer', 'Make selected text longer'),
                icon: '',
            },
            {
                code: 'make_shorter',
                name: t('doc.make_shorter', 'Make shorter'),
                tip: t('doc.tip.make_shorter', 'Make selected text shorter'),
                icon: '',
            },
            {
                code: 'make_titles',
                name: t('doc.make_titles', 'Make titles'),
                tip: t('doc.tip.make_titles', 'Make titles for document'),
                icon: '',
            }];
    }, []);
    const callTool = async (item: any) => {
        setResult('');
        if (item.code == 'translate') {
            setResult(<TranslateCard />);
        } else {

            const prompt = (promptSetting as any)[item.code];
            const text = await api.getSelectedText();
            if (!text) {
                setResult('No text selected.');
                return;
            }
            const result = await chat({
                messages: [
                    {
                        role: 'system',
                        content: `${prompt}\n Returns the language type entered by the user if the user did not specify one.`
                    },
                    {
                        role: 'user',
                        content: text,
                    }]
            });
            setResult(result.content);
        }
    };
    const renderResult = (result: any) => {
        if (typeof result == 'string') {
            return (
                <Markdown>
                    {result}
                </Markdown>
            );
        }
        return result;
    };
    return (
        <div className={cn('flex flex-col w-full p-1 overflow-auto', className)}>
            <p>
                <b>Notes:</b> Please select the text and then choose following tools.
            </p>
            <div className='grid grid-cols-2 sm:grid-cols-4 gap-1 mt-2  justify-items-center'>
                {
                    tooList.map((tool, i) => {
                        return (
                            <Button key={i} size='sm' variant='secondary' className='px-2 w-full' onClick={callTool.bind(null, tool)}>
                                {
                                    tool.name
                                }
                            </Button>

                        );
                    })
                }
            </div>
            <div className='py-1'>
                {renderResult(result)}
            </div>
        </div>
    );
}
