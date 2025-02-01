import useChatState from 'chat-list/hook/useChatState';
import React, { useEffect, useState } from 'react';
import api from '@api/index';
import ChatHeader from 'chat-list/components/header';
import { useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'chat-list/components/markdown';
import { cn } from 'chat-list/lib/utils';
import IconButton from '../icon-button';
import { Check, Copy, FileOutput, Trash } from 'lucide-react';
import Loading from '../loading';
import { useTranslation } from 'react-i18next';
import sheetApi from '@api/sheet';
import docApi from '@api/doc';
import slideApi from '@api/slide';
import { buildHtml, copyByClipboard, removeMentions } from 'chat-list/utils';
// import plugins from '../trans-box/plugins';

export default function BookMarks() {
    const { t } = useTranslation('base');
    const [list, setList] = useState([]);
    const navigate = useNavigate();
    const params = useParams();
    const [current, setCurrent] = useState(params.agent);
    const [loading, setLoading] = useState(true);
    const { docType, plugins, platform } = useChatState();
    const [copyOk, setCopyOk] = React.useState(false);

    const init = async () => {
        setLoading(true);
        const list = await api.getBookmarkList({
            type: docType,
            agent: params.agent
        });
        const msgs = list.map((item: any) => {
            return {
                id: item.id,
                content: item.data,
                type: 'text',
            };
        });
        setList(msgs);
        setLoading(false);
    };
    const loadMarks = async (agent: string) => {
        setLoading(true);
        setCurrent(agent);
        const list = await api.getBookmarkList({
            type: docType,
            agent
        });
        const msgs = list.map((item: any) => {
            return {
                id: item.id,
                content: item.data,
                type: 'text',
            };
        });

        setList(msgs);
        setLoading(false);
    };
    const onRemove = async (id: string) => {
        await api.removeBookmark({ id });
        await loadMarks(current);
    };
    const onInsertCell = async (id: string, content: string) => {
        const result = removeMentions(content);
        let html = await buildHtml(result);
        const el = document.querySelector(`#msg_${id}`);
        if (el) {
            html = el.innerHTML;
        }
        if (docType === 'sheet') {
            await sheetApi.insertText(result);
        } else if (docType === 'slide') {
            await slideApi.insertText(result);
        } else {
            if (platform === 'only' || platform == 'office') {
                await docApi.insertText(html);
            } else {
                await docApi.insertText(result);
            }
        }
    };
    const onCopy = async (id: string, content: string) => {
        const result = removeMentions(content);
        let html = await buildHtml(result);
        const el = document.querySelector(`#msg_${id}`);
        if (el) {
            html = el.innerHTML;
        }
        await copyByClipboard(result, `<div class="markdown" style="background-color: #fff;">${html}</div>`);
        setCopyOk(true);
        setTimeout(() => {
            setCopyOk(false);
        }, 1000);
    };
    function renderMessageContent(msg: { id: string, content: string, type: string, text: string }) {

        const { type, content, text, id, } = msg;

        let contentNode;


        if (type === 'text') {
            contentNode = (
                <div className="relative bubble text group pb-4">
                    <div id={`msg_${msg.id}`}>
                        <ReactMarkdown copyContentBtn={false} >{(content || text) + ''}</ReactMarkdown>
                    </div>
                    <div
                        className="absolute bottom-1 right-1 hidden group-hover:flex flex-row items-center"
                    >

                        <div
                            className="flex justify-center items-center w-5 h-5 flex-shrink-0 border bg-white rounded"
                        >
                            {/* <CopyButton content={content} /> */}
                            <IconButton
                                onClick={onCopy.bind(null, id, content)}
                                className='ml-1'
                                icon={(
                                    copyOk ? Check : Copy
                                )}
                            />
                        </div>
                        <div
                            className="flex justify-center items-center w-5 h-5 flex-shrink-0 border bg-white rounded"
                        >
                            <IconButton
                                onClick={onInsertCell.bind(null, id, content)}
                                className='ml-1'
                                icon={FileOutput}
                            />
                        </div>
                        <IconButton
                            onClick={onRemove.bind(null, msg.id)}
                            className='ml-1'
                            icon={Trash}
                        />
                    </div>
                </div>

            );
        }

        return contentNode;
    }
    const onBack = () => {
        navigate(-1);
    };
    useEffect(() => {
        init();
    }, []);
    if (loading) {
        return (
            <div className='flex flex-col flex-1 overflow-y-auto bg-white'>
                <ChatHeader onBack={onBack} title={t('common.bookmarks')} />
                <div className='flex flex-row text-sm px-2 py-1 flex-wrap w-full'>
                    <div className={cn(
                        'px-2 py-1 mr-1 mb-1 rounded-md bg-gray-100 text-center cursor-pointer',
                        current === 'all' && ' bg-primary text-white'
                    )}
                        onClick={loadMarks.bind(null, 'all')}
                    >
                        {t('common.all')}
                    </div>
                    {
                        plugins.map((plg, i) => {
                            return (
                                <div key={plg.action} className={cn(
                                    'px-2 py-1 mr-1 mb-1 rounded-md bg-gray-100 text-center cursor-pointer',
                                    current === plg.action && ' bg-primary text-white'
                                )}
                                    onClick={loadMarks.bind(null, plg.action)}
                                >
                                    {plg.name}
                                </div>
                            );
                        })
                    }
                </div>
                <Loading className='h-40' />
            </div>
        );
    }
    return (
        <div className='flex flex-col flex-1 overflow-y-auto bg-white h-screen'>
            <ChatHeader onBack={onBack} title={t('common.bookmarks')} />
            <div className='flex flex-row text-sm px-2 py-1 flex-wrap w-full'>
                <div className={cn(
                    'px-2 py-1 mr-1 mb-1 rounded-md bg-gray-100 text-center cursor-pointer',
                    current === 'all' && ' bg-primary text-white'
                )}
                    onClick={loadMarks.bind(null, 'all')}
                >
                    {t('common.all')}
                </div>
                {
                    plugins.map((plg, i) => {
                        return (
                            <div key={plg.action} className={cn(
                                'px-2 py-1 mr-1 mb-1 rounded-md bg-gray-100 text-center cursor-pointer',
                                current === plg.action && ' bg-primary text-white'
                            )}
                                onClick={loadMarks.bind(null, plg.action)}
                            >
                                {plg.name}
                            </div>
                        );
                    })
                }
            </div>
            {/* <MessageList
                className='flex-1 flex flex-col overflow-auto'

                messages={list}
                renderMessageContent={renderMessageContent}
            /> */}
            <div className='message-list pb-14 flex-1 flex flex-col space-y-2 p-2 overflow-auto'>
                {
                    list.map((item) => {
                        return (
                            <div key={item.id}>
                                {renderMessageContent(item)}
                            </div>
                        );
                    })
                }
            </div>
            {
                list.length === 0 && <div className='flex justify-center items-center h-full'>No Bookmarks</div>
            }
        </div>
    );
}
