import React from 'react';
import useChatState from 'chat-list/hook/useChatState';

import useLocalStore from 'chat-list/hook/useLocalStore';


export default function ToolList() {

    const { value: list, setValue: setList } = useLocalStore<string[]>('my-stock-list', ['AAPL']);
    const { setText } = useChatState();

    const onSelect = (id: string) => {
        setText('Help me analyze the technical indicators of stock ' + id);
    };

    if (list.length == 0) {
        return null;
    }

    return (
        <div className='flex flex-col text-sm mb-96'>
            <p className='text-base mt-3 mb-1'>
                Stocks
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
                        );
                    })
                }
            </div>
        </div>

    );
}
