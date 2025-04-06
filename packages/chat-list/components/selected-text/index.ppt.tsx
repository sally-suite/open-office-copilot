import React, { useEffect, useRef, useState } from 'react';
import docApi from '@api/slide';
import { useTranslation } from 'react-i18next';
import { Presentation, TextCursorInput, X } from 'lucide-react';
import useChatState from 'chat-list/hook/useChatState';


export default function index() {
    const { t } = useTranslation();
    const { dataContext, setDataContext, messages } = useChatState();
    const [slides, setSlides] = useState([]);
    const [text, setText] = useState('');
    const lastText = useRef({ text: '' });
    const updateContext = async () => {
        const selectedText = await docApi.getSelectedText();
        let data = '';
        let type = 'selected_text';
        let slides: {
            id: string;
            num: number;
            texts: string[];
        }[] = [];
        if (selectedText) {
            type = 'selected_text';
            // data += `${selectedText}\n\n`;
            setText(selectedText);
        } else {
            type = 'selected_slide';
            const selectSlides = await docApi.getSelectedSlides();
            slides = selectSlides;
            // const content = selectSlides.map((item) => {
            //     return `Slide[${item.num}]:\n\n${item.texts.join('\n')}`
            // }).join('\n\n');
            // data += `SLIDES:\n\n${content}`;
            setSlides(selectSlides);
        }
        console.log(slides);
        if (!selectedText && slides && slides.every(slide => Array.isArray(slide.texts) && slide.texts.every(text => text === ""))) {
            data = '';
        } else {
            data = JSON.stringify({
                type,
                text: selectedText,
                slides
            });
        }

        if (lastText.current.text == data) {
            return;
        }
        lastText.current.text = data;
        setDataContext(data);
    };
    const onDeselect = async () => {
        setDataContext('');
    };
    useEffect(() => {
        const unregist = docApi.registSelectEvent((text: string) => {
            updateContext();
        });
        return () => {
            if (unregist) {
                unregist();
            }
        };
    }, []);

    useEffect(() => {
        if (messages.length == 0) {
            lastText.current.text = '';
            updateContext();
        }
    }, [messages]);

    useEffect(() => {
        // 设置焦点事件监听器
        window.addEventListener('focus', updateContext);

        // 清理函数，在组件卸载时移除监听器
        return () => {
            window.removeEventListener('focus', updateContext);
        };
    }, []); // 空依赖数组意味着只在组件挂载和卸载时执行

    if (!dataContext) {
        return;
    }

    return (
        // <div className='flex flex-row items-center text-sm p-1 text-gray-400 '>
        <div className='flex flex-row items-center h-6 mb-1 px-1 w-auto text-sm bg-white border-b justify-start sm:w-auto  rounded-t-sm '>
            {
                text && (
                    <div className='flex-1 flex flex-row items-center overflow-hidden'>
                        <TextCursorInput height={14} width={14} className='text-gray-500' />
                        <div className='flex-1 ml-1 text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis'>
                            {text}
                            {!text && (t('doc.no_text_selected'))}
                        </div>
                        <span className='text-gray-500'>
                            [{text.length}]
                        </span>
                    </div>
                )
            }
            {
                !text && slides && slides.length > 0 && (
                    <div className='flex-1 flex flex-row items-center mr-1 overflow-hidden'>
                        <Presentation height={14} width={14} className='text-gray-500' />
                        <span className='flex-1 ml-1 text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis'>
                            [ {slides.map(p => p.num).join(', ')} ]
                        </span>
                    </div>
                )
            }
            <span className='cursor-pointer' onClick={onDeselect}>
                <X height={16} width={16} className='text-gray-500' />
            </span>
        </div>
    );
}
