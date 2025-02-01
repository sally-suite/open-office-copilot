import { clearFolder, removeFile, readFilesToData, downloadFile, readFileToBase64 } from 'chat-list/tools/sheet/python/util'
import React, { useEffect, useImperativeHandle, useState } from 'react'
import Markdown from '../markdown/plain';
import Loading from '../loading';
import { ChevronRight, ChevronUp, FileImage, FolderClosed, FolderOpen, FileSpreadsheet, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from 'chat-list/lib/utils';
import DataSheet from '../data-sheet';
import IconButton from './IconButton';
import useChatState from 'chat-list/hook/useChatState';
import slideApi from '@api/slide';

interface IFolderProps {
    showFileContent?: boolean;
    folder: string;
    folderName?: string;
    expand?: boolean;
}

export default React.forwardRef(function Folder(props: IFolderProps, ref) {
    const { folder, folderName, showFileContent = true, expand = false } = props;
    const { docType, platform } = useChatState();
    const [marks, setMarks] = useState<{ type: string, name: string, path: string, data: string | { name: string, data: string[][] }[] }[]>([]);
    const [fileStatus, setFileStatus] = useState<{ [x: string]: boolean }>({});
    const [folderStatus, setFolderStatus] = useState(expand);
    const [loading, setLoading] = useState(true)
    const { t } = useTranslation('coder');
    const init = async () => {
        try {
            setLoading(true)
            const marks = await readFilesToData(folder, showFileContent);
            setMarks(marks);
            const fsStatus = marks.reduce((pre, { name, path, data, type }, i) => {
                const fileName = `${name}.${type}`;
                return {
                    ...pre,
                    [fileName]: expand
                }
            }, {});
            setFileStatus(fsStatus)
            setLoading(false)
        } finally {
            setLoading(false)
        }
    }
    const onExpand = (name: string) => {
        setFileStatus({
            ...fileStatus,
            [name]: !fileStatus[name]
        });
    }
    const onFolderExpand = (e) => {
        setFolderStatus(!folderStatus)
    }
    const refresh = async () => {
        await init();
    }
    const renderFile = ({ type, data, name }: { type: string, name: string, data: string | { name: string, data: string[][] }[] }) => {
        if (type === 'xlsx' || type === 'xls' || type === 'csv') {
            return (
                <div className='p-2'>
                    <DataSheet data={data as { name: string, data: string[][] }[]} />
                </div>
            )
        } else if (type === 'png' || type === 'jpg' || type === 'jpeg') {
            return (
                <div className='p-2'>
                    <Markdown   >
                        {
                            `![${name}](${data})`
                        }
                    </Markdown>
                </div>
            )
        } else if (type == 'md') {
            return (
                <div className='p-2'>
                    <Markdown>
                        {
                            data as string
                        }
                    </Markdown>
                </div>
            )
        } else {
            return (
                <div className='p-2'>
                    <pre  >
                        {data as string}
                    </pre>
                </div>
            )
        }
    }
    const removeFileByPath = async (path: string, e: Event) => {
        e.stopPropagation();
        e.preventDefault();
        await removeFile(path)
        await refresh();
    }
    const downloadFileByPath = async (path: string, e: Event) => {
        e.stopPropagation();
        e.preventDefault();
        await downloadFile(path)
        await refresh();
    }
    const insertToSlide = async (path: string, e: Event) => {
        e.stopPropagation();
        e.preventDefault();
        const data = await readFileToBase64(path, 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
        // console.log('pptdata', data)
        await slideApi.insertSlidesFromBase64(data)
        // await insertToSlide(path)
        // await refresh();
    }
    useEffect(() => {
        init();
    }, [])

    useImperativeHandle(ref, () => ({
        refresh
    }));

    if (loading) {
        return (
            <Loading />
        )
    }
    console.log('folderStatus', folderStatus, expand)
    return (
        <div className='flex flex-col text-sm'>
            <div className='flex flex-row items-center justify-start p-1 cursor-pointer hover:bg-gray-100 border-b ' onClick={onFolderExpand}>
                <ChevronRight height={16} width={16} className={cn(
                    'text-gray-500 cursor-pointer transition-all pointer-events-auto',
                    folderStatus ? 'rotate-90' : ''
                )} />
                {
                    folderStatus && (
                        <FolderOpen height={16} width={16} />
                    )
                }
                {
                    !folderStatus && (
                        <FolderClosed height={16} width={16} />
                    )
                }
                <span className='ml-1'>
                    {folderName || folder}
                </span>
            </div>
            {
                folderStatus && (
                    <div className='pl-5'>
                        {
                            marks.length == 0 && (
                                <div className=' text-sm py-4 text-gray-500 text-center'>
                                    {t("folder_is_empty")}
                                </div>
                            )
                        }
                        {
                            marks.map(({ name, path, data, type }, i) => {
                                const fileName = `${name}.${type}`;
                                return (
                                    <div key={i} className='border-b'>
                                        <div className='flex flex-row items-center justify-between p-1 cursor-pointer hover:bg-gray-100' onClick={onExpand.bind(null, fileName)} >
                                            <div className='flex flex-row items-center'>
                                                {(showFileContent && data) && (
                                                    <ChevronRight className={cn(' text-gray-500 transition-transform', fileStatus[fileName] ? 'rotate-90' : '')} height={18} width={18} />
                                                )}
                                                {
                                                    (type == 'png' || type == 'jpg' || type == 'jpeg' || type == 'gif') && (
                                                        <FileImage height={18} width={18} />
                                                    )
                                                }
                                                {
                                                    (type == 'xls' || type == 'xlsx' || type == 'csv') && (
                                                        <FileSpreadsheet height={18} width={18} />
                                                    )
                                                }
                                                {
                                                    type == 'txt' && (
                                                        <FileText height={18} width={18} />
                                                    )
                                                }
                                                <span className='ml-1'>
                                                    {name}.{type}
                                                </span>
                                            </div>
                                            <div className='flex flex-row items-center'>
                                                {
                                                    platform == 'office' && docType == 'slide' && type == 'pptx' && (
                                                        <IconButton name="FileOutput" onClick={insertToSlide.bind(null, path)} />
                                                    )
                                                }
                                                {
                                                    platform != 'office' && (
                                                        <IconButton name="Download" onClick={downloadFileByPath.bind(null, path)} />

                                                    )
                                                }
                                                <IconButton name="Trash" onClick={removeFileByPath.bind(null, path)} />
                                            </div>
                                        </div>
                                        {
                                            (showFileContent && data && fileStatus[fileName]) && (
                                                <div className='p-2'>
                                                    {renderFile({ type, data, name })}
                                                </div>
                                            )
                                        }
                                    </div>
                                )
                            })
                        }
                    </div>
                )
            }


        </div>
    )
});
