import { TextCursorInput } from 'lucide-react';
import React from 'react';

interface IContextTextProps {
    text: string
}

export default function ContextText(props: IContextTextProps) {
    const { text } = props;
    return (
        <div className='flex flex-row items-center h-6 w-full px-2 text-sm bg-[#f0f1f5] border-b justify-start rounded-tl-sm '>
            <TextCursorInput height={14} width={14} className='text-gray-500' />
            <div className='flex-1 ml-1 text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis'>
                {text}
            </div>
            <span className='text-gray-500'>
                [{text.length}]
            </span>
        </div>
    );
}
