import React, { } from 'react';
import {
    Card,
    CardContent,
    CardTitle
    // RadioGroup,
} from "chat-list/components/ui/card";
import { useTranslation } from 'react-i18next'
import { downloadFile } from 'chat-list/tools/sheet/python/util';
import { DownloadCloud } from 'lucide-react';

interface ICardDownLoadProps {
    files: { type?: string, path: string, name: string }[];
    // name: string;
}

export default function CardDownLoadFromPython(props: ICardDownLoadProps) {
    const { files } = props;
    const { t } = useTranslation(['base']);

    const download = async (item: { path: string, name: string }) => {
        await downloadFile(item.path)
    }
    return (
        <Card>
            <CardTitle>{t('common.download')}</CardTitle>
            <CardContent>
                <div className='flex flex-col text-sm '>
                    {
                        files.map((item, index) => (
                            <div key={index} className='link cursor-pointer p-1 rounded-sm hover:bg-gray-100' onClick={download.bind(null, item)}>
                                {item.name}.{item.type} <DownloadCloud height={16} width={16} className='inline-block ml-1' />
                            </div>
                        ))
                    }
                </div>
            </CardContent>
        </Card>

    );
}
