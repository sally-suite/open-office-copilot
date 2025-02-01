import React from 'react'
import useChatState from 'chat-list/hook/useChatState'
import { Bookmark, Twitter, Youtube } from 'lucide-react';
import AgentPanel from 'chat-list/components/agent-panel'
import { useTranslation } from 'react-i18next'
import { cn } from 'chat-list/lib/utils';
import Button from '../button';
import Tooltip from 'chat-list/components/tooltip'
import { useNavigate } from "react-router-dom";

export default function index() {
    const { plugin, newChat, messages, docType } = useChatState();
    const { t, i18n, } = useTranslation('base');

    const navigate = useNavigate();

    const onClickBookmark = () => {
        navigate(`/bookmarks/${plugin.action}`)
    }
    return (
        <div className={cn('w-full relative z-20 border-b shadow',
            // (open) ? "h-10" : " h-0"
        )}
        >
            <div className={cn(
                'flex flex-row justify-between items-center w-full px-1 overflow-hidden transition-all h-8'
            )}>
                {
                    (docType !== 'side' && docType !== 'chat') && (
                        <AgentPanel />
                    )
                }
                <Tooltip tip={t('common.bookmarks', 'Bookmarks')}>
                    <div
                        className=' w-auto border-none px-1 py-3 cursor-pointer '
                        onClick={onClickBookmark}
                    >

                        <Bookmark height={18} width={18} />

                    </div>
                </Tooltip>
                <div className='flex-1'></div>
                {
                    messages.length > 0 && (
                        <Button className='w-20 h-6' variant='secondary' onClick={newChat} >
                            {t('base:common.new_chat')}
                        </Button>
                    )
                }

                {
                    messages.length === 0 && i18n.resolvedLanguage !== 'zh-CN' && (
                        <>

                            <Tooltip tip={t('common.video_tutorials', 'Video Tutorials')}>
                                <a target='_blank' rel="noreferrer" href="https://www.youtube.com/watch?v=TQgIkTNJxpo&list=PLmp7C8iNFkNBQpmjUyVONTUmgg1EaBHTD">
                                    <Youtube width={16} height={16} className="ml-2" />
                                </a>
                            </Tooltip>
                            <Tooltip tip={"Follow Sally Suite"}>
                                <a target='_blank' rel="noreferrer" href="https://x.com/sally_suite">
                                    <Twitter width={16} height={16} className="ml-2" />
                                </a>
                            </Tooltip>
                        </>
                    )
                }
            </div>
        </div>
    )
}
