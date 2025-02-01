// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react'
import IconButton from '../icon-button';
import { svgAsPng } from 'chat-list/utils'
import useChatState from 'chat-list/hook/useChatState';
import sheetApi from '@api/sheet';
import docApi from '@api/doc';
import slideApi from '@api/slide'
import { FileOutput } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Svg(props: any) {
    const { title = '', description = '' } = props;
    const { docType } = useChatState();
    const container = useRef<HTMLElement>(null);
    const [imageData, setImageData] = useState({});
    const [showMenu, setShowMenu] = useState(false)
    const { t } = useTranslation();

    const onInsert = async () => {
        let dataUrl = imageData.dataUrl;
        let width = imageData.width;
        let height = imageData.height;
        if (!dataUrl) {
            const svg = container.current as SVGElement;
            const rect = svg.getBoundingClientRect();
            width = rect.width;
            height = rect.height;

            const { data } = await svgAsPng(svg, 4);
            setImageData({
                dataUrl: data,
                width,
                height
            })
            dataUrl = data;
        }
        if (docType === 'sheet') {
            await sheetApi.insertImage(dataUrl, width, height, title, description)
        } else if (docType === 'doc') {
            await docApi.insertImage(dataUrl, width, height, title, description)
        } else if (docType === 'slide') {
            await slideApi.insertImage(dataUrl, width, height, title, description)
        }
    };
    const initImage = async () => {
        try {
            const svg = container.current as SVGElement;
            const rect = svg.getBoundingClientRect();
            const width = rect.width;
            const height = rect.height;
            const { data: dataUrl } = await svgAsPng(svg, 2);
            setImageData({
                dataUrl,
                width,
                height
            })
        } catch (e) {
            console.log(e)
        }
    }
    const onMouseEnter = () => {
        setShowMenu(true)
    }
    const onMouseLeave = () => {
        setShowMenu(false)
    }
    useEffect(() => {
        initImage();
    }, [])
    return (

        <div className='flex flex-row items-start justify-center relative ' onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
            {
                !imageData.dataUrl && (
                    <svg ref={container} style={{
                        display: 'inline-block'
                    }} {...props} >
                    </svg>
                )
            }
            {
                imageData.dataUrl && (
                    <img src={imageData.dataUrl} alt="" style={{
                        width: imageData.width,
                        height: imageData.height,
                        display: 'inline-block'
                    }} />
                )
            }
            {
                (docType === 'doc' || docType === 'sheet' || docType === 'slide') && showMenu && (
                    <IconButton
                        title={t('common.insert_to_doc')}
                        onClick={onInsert}
                        icon={FileOutput}
                        className=' w-auto ml-0 px-1 py-3 border-none  absolute left-1 bottom-1 '
                    >
                        {t('common.insert')}
                    </IconButton>
                )
            }
        </div>

    )
}
