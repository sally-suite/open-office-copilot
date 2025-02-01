import React, { useRef, useState } from 'react';
import IconButton from '../icon-button';
import { LineChart } from 'lucide-react';
import useChatState from 'chat-list/hook/useChatState';
import { useTranslation } from 'react-i18next';
import { base64ToFile } from 'chat-list/utils';
import Loading from '../loading';

export default function Image(props: any) {

    const { docType, plugins, setPlugin, setMode, setFileList, setText } = useChatState();
    const image = useRef(null);
    const [loading, setLoading] = useState(true);
    const [hover, setHover] = useState(false);
    const [error, setError] = useState('');
    const [hasVision] = useState(plugins.some(p => p.action === 'vision'));
    const { t } = useTranslation();

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

    const onMouseEnter = () => {
        setHover(true);
    };
    const onMouseLeave = () => {
        setHover(false);
    };
    const onError = (e: Error) => {
        setError(e.message);
        setLoading(false);
    };


    return (
        <div className='relative' onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
            {
                loading && (
                    <Loading className='h-20' />
                )
            }
            <img ref={image} className='rounded' onError={onError} onLoad={() => setLoading(false)} {...props} />
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
