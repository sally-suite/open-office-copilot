import React, { useEffect, useRef } from 'react';
import docApi from '@api/doc';
import { TextCursorInput, X } from 'lucide-react';
import useChatState from 'chat-list/hook/useChatState';
import { proxyImage } from 'chat-list/utils/img';
import { base64ToFile } from 'chat-list/utils';

interface ISelectedTextProps {
    onSelect?: (text: string) => void;
}

export default function index(props: ISelectedTextProps) {
    const { onSelect } = props;
    // const { t } = useTranslation();
    // const [text, setText] = useState('');
    const { setFileList, fileList, messages } = useChatState();
    const lastText = useRef({ text: '' });
    const { setDataContext, dataContext } = useChatState();

    const unregist = useRef(null);
    const updateContext = async () => {
        const selectedText = await docApi.getSelectedText();
        if (lastText.current.text === selectedText) {
            return;
        }
        lastText.current.text = selectedText;

        let data = '';
        if (selectedText) {
            data += `${selectedText}`;
        }
        // setText(selectedText);
        setDataContext(data);
    };
    async function init() {
        unregist.current = await docApi.registSelectEvent(async (text: string, type: 'text' | 'image' = 'text') => {
            // console.log('select text', text, type);
            if (type === 'text') {
                if (lastText.current.text === text) {
                    return;
                }
                lastText.current.text = text;
                setDataContext(text);
                // setText(text as string);
                onSelect?.(text as string);
            } else if (type === 'image') {
                // url 转 base64
                // console.log(text)
                const imageUrl = await proxyImage(text);
                const file = await base64ToFile(imageUrl, text);
                setFileList(fileList.concat([file]));
            }
        });

    }
    const onDeselect = () => {
        docApi.deselect();
        // setText('');
        setDataContext('');
    };
    useEffect(() => {
        init();
        return () => {
            if (unregist.current) {
                unregist.current();
            }
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
                {/* {text.length <= 5 && text}
                {text.length > 5 && text.slice(0, 3)}
                {text.length > 5 && <span className='text-gray-400'>...</span>}
                {text.length > 5 && text.slice(text.length - 3)} */}
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
