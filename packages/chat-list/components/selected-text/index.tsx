import React, { useEffect, useRef } from 'react';
import docApi from '@api/doc';
import { TextCursorInput, X } from 'lucide-react'
import useChatState from 'chat-list/hook/useChatState';


let timer: NodeJS.Timeout = null;
export default function index() {
    // const { t } = useTranslation();
    const lastText = useRef({ text: '' });
    const { setDataContext, dataContext } = useChatState();
    // const [text, setText] = useState('');

    const updateContext = async () => {
        const selectedText = await docApi.getSelectedText();
        let data = '';
        if (selectedText) {
            data += `${selectedText}`;
        }
        // setText(selectedText);
        setDataContext(data);
    }
    const loopSelectedText = () => {
        timer = setTimeout(async () => {
            const text = await docApi.getSelectedText();
            if (lastText.current.text === text) {
                return;
            }

            lastText.current.text = text;
            updateContext();
            await loopSelectedText();
        }, 1000)
    }
    const onDeselect = async () => {
        await docApi.deselect();
        setDataContext('');
    }
    function init() {
        // docApi.registSelectEvent((text: string) => {
        //     setText(text);
        //     onSelect?.(text);
        // })
        // if (timer) {
        //     clearTimeout(timer);
        // }
        loopSelectedText();
    }
    useEffect(() => {
        init()
        return () => {
            if (timer) {
                clearTimeout(timer);
            }
        }
    }, [])

    if (!dataContext) {
        return null;
    }

    return (
        // <div className='flex flex-row items-center text-sm p-1 text-gray-400 '>
        <div className='flex flex-row items-center h-6 mb-1 pl-1 pr-2 w-auto mx-1 text-sm bg-white border justify-start sm:w-auto rounded-sm '>
            <TextCursorInput height={14} width={14} className='text-gray-500' />
            <div className='flex-1 ml-1 text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis'>
                {dataContext}
            </div>
            <span className='text-gray-500'>
                [{dataContext.length}]
            </span>
            <span className='cursor-pointer' onClick={onDeselect}>
                <X height={16} width={16} className='text-gray-500' />
            </span>
        </div>
    )
}
