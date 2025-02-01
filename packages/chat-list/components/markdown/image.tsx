import React, { useMemo, useRef, useState } from 'react';
import IconButton from '../icon-button';
import { FileOutput, LineChart } from 'lucide-react';
import useChatState from 'chat-list/hook/useChatState';
import sheetApi from '@api/sheet';
import docApi from '@api/doc';
import { useTranslation } from 'react-i18next';
import { base64ToFile, proxyImage } from 'chat-list/utils';
import Loading from '../loading';
import slideApi from '@api/slide';
import { fail } from 'chat-list/components/ui/use-toast';

export default function Image(props: any) {
    const { src, ...rest } = props;
    const { docType, plugins, setFileList, setText } = useChatState();
    const image = useRef(null);
    const [loading, setLoading] = useState(true);
    const [hover, setHover] = useState(false);
    const [error, setError] = useState('');
    const [hasVision] = useState(plugins.some(p => p.action === 'vision'));
    const [imageSrc, setImageSrc] = useState(src);
    const { t } = useTranslation();


    const onInsertCell = async () => {
        const rect = (image.current as HTMLImageElement).getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const imageUrl = props.src;
        let imageData = imageUrl;
        try {
            if (imageUrl.startsWith('http')) {
                try {
                    // const file = await base64ToFile(props.src, 'iamge.png');
                    const result = await proxyImage(props.src);
                    imageData = result || props.src;
                } catch (e) {
                    imageData = props.src;
                }
            }
            const tarWidth = width < 500 ? 0 : width;
            const tarHeight = tarWidth > 0 ? height * (width / tarWidth) : 0;
            if (docType === 'sheet') {
                await sheetApi.insertImage(imageData, tarWidth, tarHeight);
            } else if (docType === 'doc') {
                await docApi.insertImage(imageData, tarWidth, tarHeight);
            } else if (docType === 'slide') {
                await slideApi.insertImage(imageData, tarWidth, tarHeight);
            } else if (docType == 'side') {
                await docApi.insertImage(imageData, tarWidth, tarHeight);
            }
        } catch (e) {
            fail('Sorry, insert failed. You can try copying the image to this document.');
        }

    };
    const onAnalyze = async () => {
        const plg = plugins.find(p => p.action === 'vision');
        if (plg) {
            // console.log(props.src)
            // plg['sourceImages'] = [props.src];
            // setMode('custom');
            // setPlugin(plg)
            const file = await base64ToFile(props.src, 'image.png');
            setFileList([file]);
            setText('@Vision ');
        }

    };
    const loadImage = async () => {
        const src = props.src;
        try {
            let imageData;
            if (src.startsWith('http')) {
                try {
                    // const file = await base64ToFile(props.src, 'iamge.png');
                    const result = await proxyImage(src);
                    imageData = result || props.src;
                } catch (e) {
                    setError(e.message);
                    setLoading(false);
                    return;
                }
            }
            setImageSrc(imageData);
            setLoading(false);
        } catch (e) {
            // fail('Sorry, insert failed. You can try copying the image to this document.')
            setError(e.message);
            setLoading(false);
        }
    };
    const onMouseEnter = () => {
        setHover(true);
    };
    const onMouseLeave = () => {
        setHover(false);
    };
    const onError = () => {

        // setError(e.message)
        loadImage();
        // setLoading(false)
    };
    const insertTitle = useMemo(() => {
        let tip = '';
        if (docType === 'doc') {
            tip = t('common.insert_to_doc');
        } else if (docType == 'sheet') {
            tip = t('common.insert_to_sheet');
        }
        return tip;
    }, []);


    if (error) {
        return null;
    }

    if (docType === 'chat') {
        return (
            <div className='relative'>
                {/* {
                    loading && (
                        <Loading className='h-20' />
                    )
                } */}
                <img ref={image} src={imageSrc} className='rounded' onError={onError} onLoad={() => setLoading(false)} {...rest} />
                {
                    error && (
                        <p>
                            {error}
                        </p>
                    )
                }
            </div>
        );
    }

    if (docType === 'doc') {

        return (
            <div className='relative' onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
                {/* {
                    loading && (
                        <Loading className='h-20' />
                    )
                } */}
                <img ref={image} src={imageSrc} className='rounded' onError={onError} onLoad={() => setLoading(false)} {...rest} />
                {
                    error && (
                        <p>
                            {error}
                        </p>
                    )
                }
                {
                    hover && (
                        <div className="inline-block text-sm justify-start absolute top-1 right-1">
                            <IconButton
                                title={t('common.insert_to_doc')}
                                onClick={onInsertCell}
                                icon={FileOutput}
                                className=' w-auto ml-0 px-1 py-3 border-none '
                            >
                                {t('common.insert')}
                            </IconButton>
                        </div>
                    )
                }

            </div >
        );
    }
    return (
        <div className='relative' onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
            {/* {
                loading && (
                    <Loading className='h-20' />
                )
            } */}
            <img ref={image} src={imageSrc} className='rounded' onError={onError} onLoad={() => setLoading(false)} {...rest} />
            {
                error && (
                    <p>
                        {error}
                    </p>
                )
            }
            {
                hover && (
                    <div className="inline-flex flex-row text-sm justify-start absolute top-1 right-1 space-x-1">
                        <IconButton
                            title={insertTitle}
                            onClick={onInsertCell}
                            icon={FileOutput}
                            className=' w-auto ml-0 px-1 py-3 border-none '
                        >
                            {t('common.insert')}
                        </IconButton>
                        {
                            hasVision && (
                                <IconButton
                                    title={t('common.analyze_by_vision', `Analyze by Vision`)}
                                    onClick={onAnalyze}
                                    icon={LineChart}
                                    className=' w-auto ml-0 px-1 py-3 border-none '
                                >
                                    {t('common.analyze')}
                                </IconButton>
                            )
                        }
                    </div>
                )
            }

        </div>
    );
}
