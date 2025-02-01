import React, { useEffect } from 'react';
import useChatState from 'chat-list/hook/useChatState'

import useLocalStore from 'chat-list/hook/useLocalStore';

const cryptos = [
    "BTCUSD",
    "ETHUSD",
    "USDTUSD",
    "BNBUSD",
    "XRPUSD",
    "ADAUSD",
    "SOLUSD",
    "DOGEUSD",
    "DOTUSD"
]

export default function ToolList() {
    const { value: list, setValue: setList } = useLocalStore<string[]>('my-crypto-list', [])
    const { setText } = useChatState();

    const onSelect = (id: string) => {
        setText('Help me analyze the technical indicators of crypto ' + id);
    }

    useEffect(() => {
        if (list.length == 0) {
            setList(cryptos);
        }
    }, [])
    return (
        <div className='flex flex-col text-sm mb-96'>
            <p className='text-base mt-3 mb-1'>
                Cryptos
            </p>
            <div className='grid grid-cols-2 gap-2 mt-1'>
                {
                    list.map((id) => {
                        return (
                            <div
                                className='w-full p-1 rounded-full border text-center hover:bg-gray-100 cursor-pointer'
                                key={id}
                                onClick={onSelect.bind(null, id)}
                            >
                                {id}
                            </div>
                        )
                    })
                }
            </div>
        </div>

    )
}
