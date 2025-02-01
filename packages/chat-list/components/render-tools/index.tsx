import useChatState from 'chat-list/hook/useChatState'
import React, { useEffect, useState } from 'react'
import { Button } from '../ui/button';
import { ToolFunction } from 'chat-list/types/chat';
import { Textarea } from '../ui/textarea';
import { cn } from 'chat-list/lib/utils';
import i18n from 'chat-list/locales/i18n';
import { buildChatMessage, snakeToWords } from 'chat-list/utils';
import { IChatMessage } from 'chat-list/types/message';

import ReactMarkdown from 'chat-list/components/markdown';
import CardProgress from 'chat-list/components/card-progress'
import Bubble from 'chat-list/components/bubble';

import FilesCard from 'chat-list/components/card-files'
import MessageList from 'chat-list/components/message-list';

import { useTranslation } from 'react-i18next'


export default function ToolsRender({ className = '' }: { className: string }) {
    const { plugin, messages, resetList } = useChatState();
    const [input, setInput] = useState('');
    const [tools, setTools] = useState<ToolFunction[]>([]);
    const { t } = useTranslation(['base']);
    const [result, setResult] = useState('')
    const onCall = async (tool: ToolFunction) => {
        resetList([])
        // console.log('TODO')
        // const res = await plugin.callTool(buildChatMessage(input, 'text', 'user'), tool.function.name, (content: string) => {
        //     setResult(content);
        // });
        // if (res) {
        //     setResult(result + '\n\n' + res)
        // }
        plugin.onReceive(buildChatMessage(input, 'text', 'user'), {
            tools: [tool],
            stream: true
        })
    }
    const init = () => {
        const { tools } = plugin.buildAllTools();
        setTools(tools);
        resetList([])
    }

    function renderMessageContent(msg: IChatMessage) {

        const { type, content, card, files, text, role } = msg;

        let contentNode;

        if (type === 'progress') {
            contentNode = <CardProgress percentage={msg.content}></CardProgress>;
        }

        if (type === 'card') {
            contentNode = <Bubble className="bubble" type="card" content={card || content} />;
        }

        if (type === 'text') {
            contentNode = <ReactMarkdown showTableMenu={role === 'assistant'} className="bubble text">{(content || text) + ''}</ReactMarkdown>;
        }

        if (type === 'file') {
            contentNode = (
                <FilesCard files={files} />
            )
        }

        if (type === 'parts') {
            contentNode = (
                <FilesCard text={text} files={files} title='' />
            )
        }

        if (msg?.from?.icon) {
            return (
                <div className=' w-full overflow-hidden'>
                    {contentNode}
                </div>
            )
        }
        return contentNode;
    }

    useEffect(() => {
        init();
        return () => {
            resetList([])
        }
    }, [])
    return (
        <div className={cn('flex flex-col w-full p-1 overflow-auto', className)}>
            <Textarea rows={3} className='h-20' value={input} placeholder={t('common.tool_placeholder')} onChange={(e) => setInput(e.target.value)}></Textarea>
            <div className='grid grid-cols-2 sm:grid-cols-4 gap-1 mt-2 '>
                {
                    tools.map((tool, i) => {
                        return (
                            <Button key={i} size='sm' variant='secondary' className='px-2 w-full' onClick={onCall.bind(null, tool)}>
                                {
                                    i18n.t(`tool:${tool.function.name}`, {
                                        ns: 'tool',
                                        defaultValue: snakeToWords(tool.function.name)
                                    })
                                }
                            </Button>

                        )
                    })
                }
            </div>
            <MessageList
                className='flex-1 flex flex-col overflow-auto'
                messages={messages}
                renderMessageContent={renderMessageContent}
            />
        </div>
    )
}
