
import React, { useEffect, useState } from 'react'
import { AlertCircle, Check, CheckCircle2, ChevronRight, Loader2, PlusCircle, XCircle } from 'lucide-react';
import Button from '../button'
import { getHeaderList } from 'chat-list/service/';
import docApi from '@api/doc'
import { chatByPrompt, getModel } from 'chat-list/service/message';
import recoQuestionsPrompt from './temps/recommend-questions.md'
import { buildChatMessage, columnNum2letter, extractJsonDataFromMd, parseCellAddress, template } from 'chat-list/utils';
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "chat-list/components/ui/hover-card"

import { cn } from 'chat-list/lib/utils';
import useChatState from 'chat-list/hook/useChatState';
import useUserState from 'chat-list/hook/useUserState';
import { useTranslation } from 'react-i18next';

export default function CheckContext({ className = '' }: { className?: string }) {
    const [status, setStatus] = useState<'uncheck' | 'running' | 'success' | 'failed'>('success');
    const [message, setMessage] = useState('');
    const [selectedText, setSelectedText] = useState('')
    const { sendMsg, setDataContext } = useChatState();
    const { user } = useUserState();
    const { t } = useTranslation(['base']);
    const [open, setOpen] = useState(false)

    const checkContext = async () => {
        try {
            setStatus('running')
            setOpen(false);
            const selected = await docApi.getSelectedText()
            const content = selected ? `User selected text:\n${selected}` : ''
            setSelectedText(selected);
            setDataContext(content)
            setStatus('success')
            setOpen(true);
        } catch (e) {
            setStatus('failed');
            setMessage('Please retry');
        }
    }
    const onToggle = () => {
        setOpen(!open);
    }
    const onShowPop = () => {
        if (status == 'success') {
            setOpen(true)
        } else if (status === 'failed') {
            setOpen(true)
        }
    }
    useEffect(() => {
        // checkContext();
    }, [])
    return null;
    // return (
    //     <div className={cn('flex flex-col items-start p-0 relative', className)}>
    //         {
    //             open && (
    //                 <div className=' bg-transparent fixed top-0 right-0 bottom-0 left-0 z-10 pointer-events-auto' onClick={onToggle} ></div>
    //             )
    //         }
    //         <div className=' absolute left-0 bottom-0 z-20'>
    //             <HoverCard open={open} >
    //                 <HoverCardTrigger>
    //                     <div className={cn(
    //                         'text-gray-500 z-20 cursor-pointer transition-all pointer-events-auto',
    //                     )}>
    //                         {
    //                             status === 'uncheck' && (
    //                                 <Button className='h-6 px-1 w-auto m-1 bg-white border justify-start' variant='ghost'
    //                                     onClick={checkContext}
    //                                 >
    //                                     {t('context.check_context')}
    //                                 </Button>
    //                             )
    //                         }
    //                         {
    //                             status === 'running' && (
    //                                 <Button loading={true} className='h-6 px-1 w-auto m-1 bg-white border justify-start' variant='ghost'>
    //                                     {t('context.checking_context')}
    //                                 </Button>
    //                             )
    //                         }
    //                         {
    //                             status === 'success' && (
    //                                 <Button icon={CheckCircle2}
    //                                     iconClassName='text-primary' className='group h-6 px-1 w-auto m-1 bg-white border justify-start'
    //                                     variant='ghost'
    //                                     onClick={checkContext}
    //                                     onMouseEnter={onShowPop}
    //                                 >
    //                                     <span className='w-full text-left group-hover:hidden'>
    //                                         Selected Text
    //                                     </span>
    //                                     <span className='w-full text-left hidden group-hover:block'>
    //                                         {t('context.check_context')}
    //                                     </span>
    //                                 </Button>

    //                             )
    //                         }
    //                         {
    //                             status === 'failed' && (
    //                                 <Button icon={AlertCircle}
    //                                     className='h-6 px-1 group w-auto m-1 bg-white border  text-red-500 justify-start' variant='ghost'
    //                                     onClick={checkContext}
    //                                 >
    //                                     <span className='w-full group-hover:hidden text-left'>
    //                                         {message}
    //                                     </span>
    //                                     <span className='w-full hidden text-left group-hover:block'>
    //                                         {t('context.check_context')}
    //                                     </span>
    //                                 </Button>
    //                             )
    //                         }
    //                     </div>
    //                 </HoverCardTrigger>
    //                 <HoverCardContent side='top' className='ml-1 p-1'>

    //                     {
    //                         status === 'success' && (
    //                             <>
    //                                 <div className='p-1 text-base font-bold'>
    //                                     Selected Text
    //                                 </div>
    //                                 <p className='p-1 text-base'>
    //                                     {selectedText}
    //                                 </p>
    //                             </>
    //                         )
    //                     }
    //                     {
    //                         status == 'failed' && (
    //                             <p className='p-1 text-sm whitespace-pre-wrap'>

    //                             </p>
    //                         )
    //                     }
    //                 </HoverCardContent>
    //             </HoverCard>
    //         </div>

    //     </div >
    // )
}
