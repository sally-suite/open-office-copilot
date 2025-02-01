import {
    Card,
    CardContent,
    // RadioGroup,
} from "chat-list/components/ui/card";

import React, { useState } from 'react';
import Button from '../button';
import { getHeaderList } from 'chat-list/service/sheet';
import { chatByPrompt } from 'chat-list/service/message';
import recoQuestionsPrompt from './temps/recommend-questions.md';
import { buildChatMessage, extractJsonDataFromMd, template } from 'chat-list/utils';
import useChatState from 'chat-list/hook/useChatState';
import useUserState from 'chat-list/hook/useUserState';
import i18n from 'chat-list/locales/i18n';
import { useTranslation } from 'react-i18next';
import sheetApi from '@api/sheet';
import Loading from "../loading";

const memStore: any = {
    init: false,
    status: 'uncheck',
    heads: [],
    questions: []
};

type CheckStatus = 'uncheck' | 'running' | 'success' | 'failed' | 'suggest';
interface ICardCheckHeaderProps {
    heads: string[];
    status: CheckStatus;
}

export default function CardCheckHeader(props: ICardCheckHeaderProps) {
    const [status, setStatus] = useState<CheckStatus>(props.status || 'uncheck');
    const [heads, setHeads] = useState(props.heads || []);
    const [questions, setQuestions] = useState<string[]>(memStore.questions);
    const { sendMsg, plugins, newChat } = useChatState();
    const { user } = useUserState();
    const [show, setShow] = useState(true);
    const { t } = useTranslation(['base']);

    const recommendQuestion = async (heads: string[]): Promise<string[]> => {
        const headStr = heads.join(',');
        const templ = template(recoQuestionsPrompt, {
            lang: i18n.resolvedLanguage
        });
        const result = await chatByPrompt(templ, `Table headers:${headStr}`);
        const data = extractJsonDataFromMd(result.content);

        if (plugins.find(p => p.action == 'analyst')) {
            if (data?.questions && data?.questions.length > 2) {
                data.questions[2] = `@Analyst ${data?.questions[2]}`;
            }
        }

        return data?.questions || [];
    };

    const checkContext = async () => {
        try {
            setQuestions([]);
            const { row, col, colNum, rowNum } = await sheetApi.getRowColNum();
            if (row == 1 && col == 1 && colNum == 1 && rowNum == 1) {
                setStatus('uncheck');
                return;
            }
            const heads = await getHeaderList();
            if (heads.length <= 0 || (heads.filter(p => !p).length / heads.length) >= 0.5) {
                setStatus('failed');
                return;
            } else {
                setStatus('success');
            }
            setHeads(heads);
        } catch (e) {
            setStatus('failed');
        }
    };

    const onSendQuest = (quest: string) => {
        sendMsg(buildChatMessage(quest, 'text', 'user', { name: user.username }));
        // setOpen(false);
    };
    const onClose = () => {
        newChat();
    };
    const suggest = async () => {
        const quests = await recommendQuestion(heads);
        if (quests && quests.length > 0) {
            setStatus('suggest');
            setQuestions(quests);
            // setOpen(true);
        } else {
            setStatus('success');
        }
    };

    const checkHeader = async () => {
        // setOpen(false);
        await checkContext();
        // setOpen(true);
    };

    memStore.questions = questions;
    if (status === 'uncheck') {
        return null;
    }
    if (!show) {
        return null;
    }
    return (
        <Card className="w-full">
            <CardContent className=" flex flex-col  ml-1 p-1 max-h-96">
                {
                    status === 'success' && (
                        <>
                            <div className='p-1 text-base font-bold'>
                                {t('sheet.context.check_data')}
                            </div>
                            <p className='flex-1 p-1 text-sm overflow-auto ' dangerouslySetInnerHTML={{
                                __html: t('sheet.context.check_is_fine', 'Table header check completed. Here are the headers I found: {{headers}}.If incorrect, please manually select the table region for rechecking. If everything looks good, would you like me to provide data analysis suggestions?', {
                                    headers: `${heads.join(' , ')}`
                                })
                            }} >
                            </p>
                            <div className='flex flex-row space-x-1 '>
                                <Button className=' px-4 mt-2 sm:w-auto' variant='default' onClick={suggest}>
                                    {t('sheet.context.suggestions')}
                                </Button>
                                <Button className=' px-4 mt-2 sm:w-auto' variant='secondary' onClick={checkHeader}>
                                    {t('sheet.context.retry')}
                                </Button>
                                <Button className=' px-4 mt-2 sm:w-auto' variant='secondary' onClick={onClose}>
                                    {t('common.close')}
                                </Button>
                            </div>

                        </>
                    )
                }
                {
                    status == 'failed' && (
                        <>
                            <div className='p-1 text-base font-bold text-red-500'>
                                ⚠️ {t('sheet.context.no_header_found')}
                            </div>
                            <p className='p-1 text-sm whitespace-pre-wrap'>
                                {t('sheet.context.no_header_alert')}
                            </p>
                            <div className='flex flex-row  space-x-1'>
                                <Button
                                    className='px-4 sm:w-auto  ' variant='default'
                                    onClick={checkHeader}
                                >
                                    {
                                        t('sheet.context.retry')
                                    }
                                </Button>
                            </div>
                        </>

                    )
                }
                {
                    status === 'suggest' && (
                        <>
                            <div className='p-1 text-base font-bold'>
                                {t('sheet.context.suggestions')}
                            </div>
                            {
                                questions.map((item, i) => {
                                    return (
                                        <div key={i}
                                            className='rounded-sm cursor-pointer border text-sm hover:bg-gray-100 border-gray-200  mt-1 p-1 w-full'
                                            onClick={onSendQuest.bind(null, item)}
                                        >
                                            {i + 1}.{' '}{item}
                                        </div>
                                    );
                                })
                            }
                        </>
                    )
                }
            </CardContent>
        </Card>
    );
}
