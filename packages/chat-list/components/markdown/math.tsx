// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react';
import IconButton from '../icon-button';
import { svgToImage } from 'chat-list/utils';
import useChatState from 'chat-list/hook/useChatState';
import sheetApi from '@api/sheet';
import docApi from '@api/doc';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function MathMark(props: any) {
    const { docType } = useChatState();
    const container = useRef<HTMLElement>(null);
    const [imageData, setImageData] = useState<any>({});
    const { t } = useTranslation();

    const onInsert = async () => {
        let dataUrl = imageData.dataUrl;
        let width = imageData.width;
        let height = imageData.height;
        if (!dataUrl) {
            const svg = container.current.childNodes[0] as SVGElement;
            const rect = svg.getBoundingClientRect();
            width = rect.width;
            height = rect.height;
            dataUrl = await svgToImage(svg);
        }

        if (docType === 'sheet') {
            await sheetApi.insertImage(dataUrl, width, height);
        } else {
            await docApi.insertImage(dataUrl, width, height);
        }
    };
    const initImage = async () => {
        const svg = container.current.childNodes[0] as SVGElement;
        const rect = svg.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const imageData = await svgToImage(svg);
        setImageData({
            dataUrl: imageData,
            width,
            height
        });
    };
    useEffect(() => {
        initImage();
    }, []);
    return (

        <div className='flex flex-row items-center'>
            {
                !imageData.dataUrl && (
                    <mjx-container style={{
                        display: 'inline-block'
                    }} ref={container} {...props} >
                    </mjx-container>
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

            <IconButton
                title={t('common.insert_to_doc')}
                className='ml-0 p-0 w-4 h-4 '
                onClick={onInsert}
                icon={Plus}
            >

            </IconButton>
        </div>



    );
}
