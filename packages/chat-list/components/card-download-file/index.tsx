import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface ICardDownLoadProps {
    files: File[];
    // name: string;
}

export default function CardCreate(props: ICardDownLoadProps) {
    const { files } = props;
    const { t } = useTranslation(['base']);

    const lk = useRef<HTMLDivElement>(null);
    const urls = useRef(files.map(file => {
        return {
            url: URL.createObjectURL(file),
            name: file.name
        };
    }));
    const load = () => {
        lk.current.querySelector('a').click();
    };
    useEffect(() => {
        load();
    }, []);
    return (
        <div ref={lk} className='flex flex-col markdown bubble text'>
            {
                urls.current.map((item, index) => (
                    <a key={index} className='link' href={item.url} download={item.name}>{t('common.download')} {item.name}</a>
                ))
            }
        </div>
    );
}
