
import React, { useEffect, useRef, useState } from 'react'
import { Grid3X3, RefreshCw } from 'lucide-react';
import Button from '../button'
import sheetApi from '@api/sheet'
import { cn } from 'chat-list/lib/utils';
import useChatState from 'chat-list/hook/useChatState';
import { useTranslation } from 'react-i18next';
import './index.less';

const memStore: any = {
    init: false,
    status: 'uncheck',
    heads: [],
    questions: []
}


export default function CheckContext({ className = '' }: { className?: string }) {
    const [status, setStatus] = useState<'uncheck' | 'running' | 'success' | 'failed' | 'suggest'>(memStore.status);
    const [questions, setQuestions] = useState<string[]>(memStore.questions);
    const { docType, appendMsg, setDataContext, dataContext, messages, plugin } = useChatState();
    const { t } = useTranslation(['base']);
    const [address, setAddress] = useState('');
    const lastAddress = useRef({ address: '' });

    const checkContext = async () => {
        try {
            setStatus('running')
            // setQuestions([]);
            // const sheetInfo = await sheetApi.getSheetInfo();
            // const currentSheet = sheetInfo.sheetInfo.find(p => p.sheetName == sheetInfo.current)
            // const heads = currentSheet.headers.map(p => p.name);
            // if (heads.length <= 0 || (heads.filter(p => !p).length / heads.length) >= 0.5) {
            //     setStatus('failed');
            //     // appendMsg(buildChatMessage(<CardCheckHeader status={'failed'} heads={heads} />, 'card', 'assistant'));
            // } else {
            //     setStatus('success');
            //     // appendMsg(buildChatMessage(<CardCheckHeader status={'success'} heads={heads} />, 'card', 'assistant'));
            // }
            const sheetInfo = await sheetApi.getSheetInfo();
            const address = sheetInfo.activeRange;

            lastAddress.current.address = address;
            setAddress(address);
            setDataContext(JSON.stringify(sheetInfo, null, 2))

            setStatus('success');

        } catch (e) {
            console.log(e.message)
            setStatus('failed');
            // appendMsg(buildChatMessage(<CardCheckHeader status={'failed'} heads={[]} />, 'card', 'assistant'));
        } finally {
            setStatus('success');
        }
    }

    const initEvent = async () => {
        return sheetApi?.registSelectEvent?.(async ({ _address, values }) => {
            if (plugin.memory.length > 0) {
                return;
            }
            const sheetInfo = await sheetApi.getSheetInfo();
            if (!sheetInfo) {
                return;
            }
            const address = sheetInfo.activeRange;

            if (lastAddress.current.address == address) {
                setStatus('success')
                return;
            }

            lastAddress.current.address = address;
            setAddress(address);
            setDataContext(JSON.stringify(sheetInfo, null, 2))
        })
    }
    const checkHeader = async () => {
        await checkContext();
    }
    const updateContext = async () => {
        try {
            setStatus('running')
            // const address = await sheetApi.getRangeA1Notation();

            const sheetInfo = await sheetApi.getSheetInfo();

            if (!sheetInfo) {
                return;
            }
            const address = sheetInfo.activeRange;

            if (lastAddress.current.address == address) {
                setStatus('success')
                return;
            }

            lastAddress.current.address = address;
            setAddress(address)
            setDataContext(JSON.stringify(sheetInfo, null, 2))
            setStatus('success')
        } finally {
            setStatus('success')
        }
    }
    const init = async () => {
        await updateContext();
        const unregist = await initEvent();
        return unregist;
    }

    useEffect(() => {
        const unregist = init();
        return () => {
            if (unregist) {
                unregist.then((unreg: any) => {
                    unreg?.();
                })
            }
        }
    }, [])


    useEffect(() => {
        if (messages.length == 0) {
            lastAddress.current.address = '';
            updateContext();
        }
    }, [messages])

    if (!dataContext) {
        return null;
    }

    return (
        <div className={cn('flex flex-row items-center h-6 mb-1 px-0 w-auto text-sm bg-white border-b justify-start sm:w-auto  rounded-t-sm relative', className)}>
            <div
                className='flex flex-row items-center text-sm ml-1 space-x-1 cursor-pointer'
                onClick={updateContext}
            >
                <Grid3X3 className='h-4 w-4' />
                <span>
                    {address}
                </span>
            </div>
            <div className={cn(
                'border-none cursor-pointer ml-1',
                status == 'running' ? " text-gray-300" : ""
            )}
                onClick={updateContext}
            >
                <RefreshCw className={cn(
                    'h-4 w-4',
                    status == 'running' ? "rotate" : ""
                )} />
            </div>
        </div >
    )
    // return (
    //     <div className={cn('flex flex-col items-start p-0 relative', className)}>
    //         <div className='flex flex-row items-center'>
    //             <div className={cn(
    //                 'text-gray-500 z-20 cursor-pointer transition-all pointer-events-auto',
    //             )}>
    //                 {
    //                     status === 'uncheck' && (
    //                         <Tooltip tip={t('sheet.context.check_data_tip')}>
    //                             <Button className='context-button' variant='ghost'
    //                                 icon={Grid3X3}
    //                                 onClick={checkHeader}
    //                             >
    //                                 {`${address}`}
    //                             </Button>
    //                         </Tooltip>
    //                     )
    //                 }
    //                 {
    //                     status === 'running' && (
    //                         <Button loading={true} className='context-button' variant='ghost'>
    //                             {t('sheet.context.checking_data')}
    //                         </Button>
    //                     )
    //                 }
    //                 {
    //                     (status === 'success' || status == 'suggest') && (
    //                         <Button icon={Grid3X3}
    //                             className='group context-button'
    //                             variant='ghost'
    //                             onClick={checkHeader}
    //                         >
    //                             {
    //                                 address
    //                             }
    //                         </Button>

    //                     )
    //                 }
    //                 {
    //                     status === 'failed' && (
    //                         <Tooltip tip={t('sheet.context.check_data_tip')}>
    //                             <Button icon={AlertCircle}
    //                                 className='context-button text-red-500 ' variant='ghost'
    //                                 onClick={checkHeader}
    //                             >
    //                                 {t('sheet.context.retry')}
    //                             </Button>
    //                         </Tooltip>
    //                     )
    //                 }
    //             </div>
    //         </div>
    //     </div >
    // )
}
