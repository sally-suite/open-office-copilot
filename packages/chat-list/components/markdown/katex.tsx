import useChatState from 'chat-list/hook/useChatState';
import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { cn } from 'chat-list/lib/utils';
import docApi from '@api/doc';
import slideApi from '@api/slide';
import { Button } from '../ui/button';
import html2canvas from 'html2canvas';

export default function Katex(props: any) {
    const { className, ...rest } = props;
    const { docType } = useChatState();
    const [showMenu, setShowMenu] = useState(false)

    const { t } = useTranslation();
    const containerRef = useRef(null);

    const onInsert = async () => {

        // 从containerRef的子节点中找到annotation节点
        const annotationNode = containerRef.current?.querySelector('annotation');
        const mark = annotationNode.textContent;
        await docApi.insertText(`$$${mark}$$`, {
            type: 'text'
        })
    };
    const onInsertSlide = async () => {
        const html = containerRef.current.querySelector('.katex-html');
        console.log(html)
        html2canvas(html).then(function (canvas) {
            // 将canvas转换为图像并显示
            // const img = document.createElement('img');
            const base64 = canvas.toDataURL();
            console.log(base64)
            // document.getElementById('image-container').appendChild(img);
            slideApi.insertImage(base64);
        });
    }
    const onMouseEnter = () => {
        setShowMenu(true)
    }
    const onMouseLeave = () => {
        setShowMenu(false)
    }
    return (
        <span ref={containerRef}
            className={
                cn(className, 'relative')
            }
            {...rest}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}>
            {props.children}
            {
                docType === 'doc' && showMenu && (
                    <Button
                        onClick={onInsert}
                        variant='secondary'
                        className='rounded p-0 text-sm font-normal absolute top-0 right-0 w-5 h-5 flex-shrink-0 border border-gray-300 bg-white'
                    >
                        +
                    </Button>
                )
            }
            {
                docType === 'slide' && showMenu && (
                    <Button
                        onClick={onInsertSlide}
                        variant='secondary'
                        className='rounded p-0 text-sm font-normal absolute top-0 right-0 w-5 h-5 flex-shrink-0 border border-gray-300 bg-white'
                    >
                        +
                    </Button>
                )
            }
        </span>
    )
}
