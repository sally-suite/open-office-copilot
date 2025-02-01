import React, { useEffect, useRef, useState } from 'react';
import docApi from '@api/slide';
import { useTranslation } from 'react-i18next';
import { Presentation, TextCursorInput, X } from 'lucide-react';
import useChatState from 'chat-list/hook/useChatState';

let timer: any;
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
        } else {
            type = 'selected_slide';
            const selectSlides = await docApi.getSelectedSlides();
            // const content = selectSlides.map((item) => {
            //     return `PPT Slide[${item.num}]:\n\n${item.texts.join('\n')}`
            // }).join('\n\n');
            // data += `SLIDES:\n\n${content}`;
            slides = selectSlides;
            setSlides(selectSlides);
        }
        if (!selectedText && (slides && slides.length == 0)) {
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
        setText(selectedText);
        setDataContext(data);
    };
    const loopSelectedText = () => {
        timer = setTimeout(async () => {
            updateContext();
            await loopSelectedText();
        }, 1000);
        return timer;
    };

    const onDeselect = async () => {
        setDataContext('');
    };

    // useEffect(() => {
    //     loopSelectedText();
    //     return () => {
    //         if (timer) {
    //             clearTimeout(timer);
    //         }
    //     }
    // }, [messages])

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
