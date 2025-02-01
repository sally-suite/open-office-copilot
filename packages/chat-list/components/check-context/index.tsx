
import React, { useEffect, useRef, useState } from 'react'
import { Grid3X3, RefreshCw } from 'lucide-react';
import Button from '../button'
import { cn } from 'chat-list/lib/utils';
import useChatState from 'chat-list/hook/useChatState';
import { useTranslation } from 'react-i18next';
import sheetApi from '@api/sheet'
import './index.less';
import IconButton from '../icon-button';

const memStore: any = {
    init: false,
    status: 'uncheck',
    heads: [],
    questions: []
}
let timer: NodeJS.Timeout;
export default function CheckContext({ className = '' }: { className?: string }) {
    const [status, setStatus] = useState<'uncheck' | 'running' | 'success' | 'failed' | 'suggest'>(memStore.status);
    const [questions, setQuestions] = useState<string[]>(memStore.questions);
    const { appendMsg, plugin, dataContext, setDataContext, messages } = useChatState();
    const { t } = useTranslation(['base']);
    const [address, setAddress] = useState('');
    const lastAddress = useRef({ address: '' });

    const updateContext = async () => {

        try {
            setStatus('running')
            const address = await sheetApi.getRangeA1Notation();
            if (lastAddress.current.address == address) {
                setStatus('success')
                return;
            }

            lastAddress.current.address = address;
            setAddress(address)

            const sheetInfo = await sheetApi.getSheetInfo();
            // const sheetInfo = await sheetApi.getSheetInfo();
            setDataContext(JSON.stringify(sheetInfo, null, 2))
            setStatus('success')
        } catch (e) {
            setStatus('failed');
            // appendMsg(buildChatMessage(<CardCheckHeader status={'failed'} heads={[]} />, 'card', 'assistant'));
        } finally {
            setStatus('success');
        }
    }

    const loopAddress = async () => {
        timer = setTimeout(async () => {

            if (plugin.memory.length > 0) {
                return;
            }
            // const sheetInfo = await sheetApi.getSheetInfo();
            const address = await sheetApi.getRangeA1Notation();
            // const address = sheetInfo.activeRange;
            if (lastAddress.current.address == address) {
                await loopAddress()
                return;
            }
            lastAddress.current.address = address;
            setAddress(address);

            const sheetInfo = await sheetApi.getSheetInfo();
            // const sheetInfo = await sheetApi.getSheetInfo();
            setDataContext(JSON.stringify(sheetInfo, null, 2))
            await loopAddress()
        }, 1000)
    }
    const init = async () => {
        // if (!memStore.init) {
        //     memStore.init = true;
        //     // await getAddress();

        // }
        await loopAddress()
    }
    useEffect(() => {
        init();
        return () => {
            if (timer) {
                clearTimeout(timer)
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
        <div className={cn('flex flex-row items-center  h-6 mb-1 px-0 w-auto text-sm bg-white border-b justify-start sm:w-auto  rounded-t-sm relative', className)}>
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
}
