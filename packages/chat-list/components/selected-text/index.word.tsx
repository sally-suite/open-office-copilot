import React, { useEffect, useRef } from 'react';
import docApi from '@api/doc';
import { TextCursorInput, X } from 'lucide-react';
import useChatState from 'chat-list/hook/useChatState';
interface ISelectedTextProps {
    onSelect?: (text: string) => void;
}

export default function index(props: ISelectedTextProps) {
    const { onSelect } = props;
    // const { t } = useTranslation();
    const { setDataContext, dataContext, messages } = useChatState();
    // const [text, setText] = useState('');
    const lastText = useRef({ text: '' });

    const updateContext = async () => {
        const selectedText = await docApi.getSelectedText();
        let data = '';
        if (selectedText) {
            data += `${selectedText}`;
        }
        // setText(selectedText);
        setDataContext(data);
    };
    function init() {
        docApi.registSelectEvent((text: string) => {
            if (lastText.current.text === text) {
                return;
            }
            lastText.current.text = text;
            // setText(text);
            updateContext();
            onSelect?.(text);
        });
        updateContext();
    }

    const onDeselect = async () => {
        await docApi.deselect();
        setDataContext('');
    };

    useEffect(() => {
        const unregist = docApi.registSelectEvent((text: string) => {
            if (lastText.current.text === text) {
                return;
            }
            lastText.current.text = text;
            // setText(text);
            updateContext();
            onSelect?.(text);
        });
        return () => {
            unregist?.();
        };
    }, []);

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
    );
}
