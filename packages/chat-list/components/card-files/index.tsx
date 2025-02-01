// FileList.js
import { File, Image } from 'lucide-react';
import React, { useState } from 'react';
import ImageFile from '../ImageFile';
import { formatFileSize } from 'chat-list/utils/file';

interface IFileListProps {
    title?: string;
    text?: string;
    files: File[];
}


const FileList = ({ title = 'File List', files, text }: IFileListProps) => {

    const [visible, setVisible] = useState<{ [x: string]: boolean }>({});
    const showMore = (id: string) => {
        setVisible({
            ...visible,
            [id]: !visible[id]
        });
    };
    const renderPreview = (file: File & { content: string }) => {
        if (file.type.startsWith('image')) {
            return (
                <div className=' overflow-hidden rounded'>
                    <ImageFile file={file} />
                    <p>
                        {file.content}
                    </p>
                </div>

            );
        }
        return file.content;
    };
    return (
        <div className="flex flex-col p-2 shadow rounded-xl rounded-tr-none items-center bg-white w-card">
            <h2 className="w-full text-left pl-2 text-base mb-1">{title}</h2>
            {/* {files.map((file, index) => (
                <FileCard key={index} file={file} />
            ))} */}
            <div className="flex flex-col w-full my-1">
                {
                    files.map((file: File & { content: string }, i) => {
                        return (
                            <div className="flex flex-col text-sm p-1  text-gray-600 mb-1" key={file.name}>
                                <div className='flex flex-row items-center justify-between overflow-hidden'>
                                    <span className="flex flex-row flex-1 overflow-hidden">
                                        <span className="flex justify-center items-center w-4">


                                            {
                                                file.type.startsWith('image') ? <Image height={14} width={14} /> : <File height={14} width={14} />
                                            }
                                        </span>
                                        <span className="whitespace-nowrap overflow-ellipsis overflow-hidden w-4/5">{file.name}</span>
                                    </span>
                                    <span className="flex justify-center items-center mr-1 cursor-pointer" >
                                        {formatFileSize(file.size)}
                                    </span>
                                </div>
                                <div className={`text-ellipsis overflow-hidden w-full pl-4 pr-1  text-gray-400 cursor-pointer ${visible[file.name] ? '' : ' whitespace-nowrap'}`} onClick={showMore.bind(null, file.name)}>
                                    {
                                        renderPreview(file)
                                    }
                                </div>
                            </div>
                        );
                    })
                }
            </div>
            <p className='markdown mt-1  pl-4 pr-1'>
                {text}
            </p>
        </div>
    );
};

export default FileList;

