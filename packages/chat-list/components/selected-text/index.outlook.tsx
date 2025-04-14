import React, { useEffect, useRef, useState } from 'react';
import docApi from '@api/email';
import { TextCursorInput, Mail, X } from 'lucide-react';
import useChatState from 'chat-list/hook/useChatState';
import { htmlToText } from 'chat-list/utils';
interface ISelectedTextProps {
    onSelect?: (text: string) => void;
}

export default function index(props: ISelectedTextProps) {
    const { onSelect } = props;
    const [type, setType] = useState('text');
    const lastText = useRef({ text: '' });
    const { setDataContext, dataContext, messages, plugin } = useChatState();

    const onDeselect = async () => {
        await docApi.deselect();
        setDataContext('');
    };

    const updateContext = async () => {
        const selectedText = await docApi.getSelectedText();
        if (lastText.current.text === selectedText) {
            return;
        }
        lastText.current.text = selectedText;

        const data = htmlToText(selectedText);
        setDataContext(data);
    };

    function registEvent() {
        return docApi.registSelectEvent((text: string, type: 'text' | 'email') => {

            if (lastText.current.text === text) {
                return;
            }

            lastText.current.text = text;
            setType(type);
            setDataContext(text);
            onSelect?.(text);

        });

    }

    useEffect(() => {
        // 设置焦点事件监听器
        window.addEventListener('focus', updateContext);

        // 清理函数，在组件卸载时移除监听器
        return () => {
            window.removeEventListener('focus', updateContext);
        };
    }, []); // 空依赖数组意味着只在组件挂载和卸载时执行

    useEffect(() => {
        if (messages.length == 0) {
            lastText.current.text = '';
            updateContext();
        }
    }, [messages]);

    if (!dataContext) {
        return null;
    }

    return (
        // <div className='flex flex-row items-center text-sm p-1 text-gray-400 '>
        <div className='flex flex-row items-center h-6 mb-1 px-1 w-auto text-sm bg-white border-b justify-start sm:w-auto  rounded-t-sm '>
            {
                type == 'text' && <TextCursorInput height={14} width={14} className='text-gray-500' />
            }
            {
                type == 'email' && <Mail height={14} width={14} className='text-gray-500' />
            }
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
    );
}