import React, { useRef, useState } from 'react'
import IconButton from 'chat-list/components/icon-button';
import { FileOutput } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { proxyImage } from 'chat-list/utils';

export default React.memo(function Image(props: any) {
    const { src, onInsert, ...rest } = props;
    const image = useRef(null);
    const [loading, setLoading] = useState(true);
    const [hover, setHover] = useState(false);
    const [error, setError] = useState('');
    const [imageSrc, setImageSrc] = useState<string>(src);
    const { t } = useTranslation();

    const onInsertCell = async () => {
        if (!imageSrc.startsWith('data:image')) {
            const result = await proxyImage(src);
            if (result) {
                onInsert?.(image.current, result);
            } else {
                onInsert?.(image.current);
            }
        } else {
            onInsert?.(image.current, imageSrc);
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
                    setError(e.message)
                    setLoading(false)
                    return;
                }
            }
            setImageSrc(imageData);
            setLoading(false)
        } catch (e) {
            // fail('Sorry, insert failed. You can try copying the image to this document.')
            setError(e.message)
            setLoading(false)
        }
    }
    const onMouseEnter = () => {
        setHover(true)
    }
    const onMouseLeave = () => {
        setHover(false)
    }
    const onError = () => {

        // setError(e.message)
        loadImage();
        // setLoading(false)
    }

    if (error) {
        return null;
    }
    console.log(imageSrc)
    return (
        <div className='relative' onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
            <img ref={image} src={imageSrc} className='rounded' onError={onError} onLoad={() => setLoading(false)} {...rest} />
            {
                hover && (
                    <div className="inline-flex flex-row text-sm justify-start absolute top-1 right-1 space-x-1">
                        <IconButton
                            onClick={onInsertCell}
                            icon={FileOutput}
                            className=' w-auto ml-0 px-1 py-3 border-none '
                        >
                            {t('common.insert')}
                        </IconButton>
                    </div>
                )
            }

        </div>
    )
})
