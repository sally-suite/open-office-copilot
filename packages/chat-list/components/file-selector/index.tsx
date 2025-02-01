import React, { useCallback, useState } from 'react';
import { FileRejection, useDropzone } from 'react-dropzone';
import { LucideIcon, Paperclip } from 'lucide-react';
import Modal from 'chat-list/components/modal'
interface IFileSelectorProps {
    icon?: LucideIcon;
    config?: {
        maxSize?: number;
        maxFiles?: number;
        multiple?: boolean;
        accept?: {
            image?: boolean;
            text?: boolean;
            xlsx?: boolean;
        };
    };
    children?: React.ReactNode;
    onSelect?: (files: File[]) => void;
}

function buildFileAccept(accept: any) {
    let config = {};
    if (accept?.image) {
        config = Object.assign(config, {
            'image/png': ['.png'],
            'image/jpeg': ['.jpg', '.jpeg'],
        })
    }
    if (accept?.text) {
        config = Object.assign(config, {
            'text/pdf': ['.pdf'],
            'text/plain': ['.txt', '.csv', '.md'],
            'application/msword': ['.doc', '.docx'],
        })
    }
    if (accept?.xlsx) {
        config = Object.assign(config, {
            'text/plain': ['.csv'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-excel': ['.xls']
        })
    }
    return config;
}

const FileSelector = (props: IFileSelectorProps) => {
    const { config, icon = Paperclip, children, onSelect } = props;
    const [open, setOpen] = useState(false)
    const [rejectedFiles, setRejectedFiles] = useState([] as FileRejection[])
    // const onDrop = (acceptedFiles: File[]) => {
    //     // 处理文件上传逻辑，可以使用 fetch 或其他方式发送文件到服务器
    //     // console.log('上传的文件:', acceptedFiles);
    //     onSelect?.(acceptedFiles)
    // };

    const { getRootProps, getInputProps } = useDropzone({
        accept: buildFileAccept(config.accept),
        onDrop: (acceptedFiles: File[]) => {
            onSelect?.(acceptedFiles)
        },
        onDropRejected: (rejectedFiles: FileRejection[]) => {
            // console.log('Rejected files: ', rejectedFiles, event);
            // rejectedFiles.map(p => p.errors[0].message)
            // toast.show('')
            setRejectedFiles(rejectedFiles);
            setOpen(true)
        },
        maxSize: config.maxSize || 2 * 1014 * 1024,
        maxFiles: config.maxFiles || 9,
        multiple: (typeof config.multiple === 'undefined' || config.multiple == null) ? false : config.multiple,
        noDrag: true,
        onDragEnter: null,
        onDragOver: null,
        onDragLeave: null,
    });

    function handleClose() {
        setOpen(false);
        setRejectedFiles([]);
    }

    const Icon = icon;
    return (
        <>

            <div className='flex justify-center items-center cursor-pointer' {...getRootProps()} >
                <input {...getInputProps()} />
                <Icon height={18} width={18} />
                {
                    children && (
                        <span className=' text-sm ml-1'>
                            {children}
                        </span>
                    )
                }
            </div>
            <Modal
                open={open}
                title="File Upload Error"
                onClose={handleClose}
                showConfirm={false}
            >
                <div className='markdown' onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                }}>
                    <p className='mb-2'>
                        These files failed to upload, please check the reason for the failure.
                    </p>
                    {
                        rejectedFiles.map((fi, i) => {
                            return (
                                <div className='text-sm mb-1' key={fi.file.name}>
                                    <div className='mb-1 overflow-hidden text-ellipsis whitespace-nowrap'>
                                        {i + 1}. {fi.file.name}
                                    </div>
                                    <div className=' text-red-500 pl-4'>{fi.errors[0].message}</div>
                                </div>
                            )
                        })
                    }
                </div>
            </Modal>
        </>
    );
};

export default FileSelector;
