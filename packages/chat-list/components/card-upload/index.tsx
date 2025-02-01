import React, { useState } from 'react';
import {
    Card,
    CardContent,
    CardTitle,
    CardActions,
    // RadioGroup,
} from "chat-list/components/ui/card";
import Button from '../button';
import FileSelector from 'chat-list/components/file-selector'
import { useTranslation } from 'react-i18next';
import { cn } from 'chat-list/lib/utils';
import { UploadCloud, XCircle } from 'lucide-react';

export interface ICardUpdateConfirmProps {
    onUpload?: (fiels: File[]) => void;
}

export default React.memo(function CardSelectRange(
    props: ICardUpdateConfirmProps
) {
    const { onUpload } = props;
    const [files, setFiles] = useState<File[]>([])
    const { t } = useTranslation();
    const onOk = async () => {
        onUpload?.(files);
    };

    const removeImage = (index: number) => {
        setFiles(files.filter((_, i) => i !== index))
        // setFiles(files.filter((_, i) => i !== index))
    }
    const onFileSelect = async (fs: File[]) => {
        setFiles?.(files.concat(fs))
    }
    return (
        <Card className="w-card">
            <CardTitle>Upload files</CardTitle>
            <CardContent className="flex flex-col items-start overflow-hidden">
                <FileSelector icon={UploadCloud} config={{ maxSize: 99999999999999, maxFiles: 9, multiple: true }} onSelect={onFileSelect} >
                    Upload from computer
                </FileSelector>
                <div className={cn(['w-full flex flex-col py-1'])}>
                    {
                        files.map((file, i) => {
                            return (
                                <div key={i} className='flex flex-row text-sm items-center p-1 px-2 justify-between hover:bg-gray-100 rounded-sm' >
                                    <span className='flex-1 overflow-hidden text-ellipsis whitespace-nowrap'>
                                        {file.name}
                                    </span>
                                    <XCircle height={14} width={14} onClick={removeImage.bind(null, i)} className=" text-gray-500 cursor-pointer" />
                                </div>
                            )
                        })
                    }
                </div>
            </CardContent>
            <CardActions>
                <Button action="select-range" className='mx-1' color="primary" onClick={onOk}>
                    Ok
                </Button>
            </CardActions>
        </Card>
    );
});
