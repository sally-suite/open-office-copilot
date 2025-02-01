import { clearFolder, removeFile, readFilesToData, downloadFile } from 'chat-list/tools/sheet/python/util';
import React, { useEffect, useImperativeHandle, useState } from 'react';
import Markdown from '../markdown';
import Loading from '../loading';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from 'chat-list/lib/utils';
import DataSheet from '../data-sheet';
import IconButton from './IconButton';

interface IFolderProps {
    folder: string;
}

export default React.forwardRef(function Folder(props: IFolderProps, ref) {
    const { folder } = props;
    const [marks, setMarks] = useState<{ type: string, name: string, path: string, data: string | { name: string, data: string[][] }[] }[]>([]);
    const [fileStatus, setFileStatus] = useState<{ [x: string]: boolean }>({});
    const [loading, setLoading] = useState(true);
    const { t } = useTranslation('coder');
    const init = async () => {
        try {
            setLoading(true);
            const marks = await readFilesToData(folder);
            setMarks(marks);
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };
    const onExpand = (name: string) => {
        setFileStatus({
            ...fileStatus,
            [name]: !fileStatus[name]
        });
    };
    const refresh = async () => {
        await init();
    };
    const renderFile = ({ type, data, name }: { type: string, name: string, data: string | { name: string, data: string[][] }[] }) => {
        if (type === 'xlsx' || type === 'xls' || type === 'csv') {
            return (
                <div className='p-2'>
                    <DataSheet data={data as { name: string, data: string[][] }[]} />
                </div>
            );
        } else if (type === 'png' || type === 'jpg' || type === 'jpeg') {
            return (
                <div className='p-2'>
                    <Markdown copyContentBtn={false} >
                        {
                            `![${name}](${data})`
                        }
                    </Markdown>
                </div>
            );
        } else {
            return (
                <div className='p-2'>
                    <Markdown copyContentBtn={false} >
                        {data as string}
                    </Markdown>
                </div>
            );
        }
    };
    const removeFileByPath = async (path: string, e: Event) => {
        e.stopPropagation();
        e.preventDefault();
        await removeFile(path);
        await refresh();
    };
    const downloadFileByPath = async (path: string, e: Event) => {
        e.stopPropagation();
        e.preventDefault();
        await downloadFile(path);
        await refresh();
    };
    useEffect(() => {
        init();
    }, []);

    useImperativeHandle(ref, () => ({
        refresh
    }));

    if (loading) {
        return (
            <Loading />
        );
    }

    return (
        <div className='flex flex-col text-sm'>
            {
                marks.length == 0 && (
                    <div className=' text-sm py-4 text-gray-500 text-center'>
                        {t("folder_is_empty")}
                    </div>
                )
            }
            {
                marks.map(({ name, path, data, type }, i) => {
                    return (
                        <div key={i} className='border-b'>
                            <div className='flex flex-row items-center justify-between p-1 cursor-pointer hover:bg-gray-100' onClick={onExpand.bind(null, name)} >
                                <div className='flex flex-row items-center'>
                                    <ChevronRight className={cn(' text-gray-500 transition-transform', !fileStatus[name] ? 'rotate-90' : '')} height={18} width={18} />
                                    {name}.{type}
                                </div>
                                <div className='flex flex-row items-center'>
                                    <IconButton name="Download" onClick={downloadFileByPath.bind(null, path)} />
                                    <IconButton name="Trash" onClick={removeFileByPath.bind(null, path)} />
                                </div>
                            </div>
                            {
                                !fileStatus[name] && (
                                    <div className='p-2'>
                                        {renderFile({ type, data, name })}
                                    </div>
                                )
                            }
                        </div>
                    );
                })
            }
        </div>
    );
});
