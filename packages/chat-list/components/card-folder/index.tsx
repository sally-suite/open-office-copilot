import React from 'react';
import {
    Card,
    CardContent,
    CardTitle,
    // RadioGroup,
} from "chat-list/components/ui/card";
import Folder from '../code-editor/Folder';
import { useTranslation } from 'react-i18next';

interface ICardFilterProps {
    folders: string[];
    expand?: boolean;
}

export const FolderList = ({ folders, expand }: { folders: string[], expand?: boolean }) => {
    return (
        <div className="flex flex-col flex-1 shrink-0 overflow-auto  border-gray-300">
            {
                folders.map((path) => {
                    return (
                        <Folder key={path} folder={path} folderName={path.substring(1)} expand={expand} />
                    )
                })
            }
        </div>
    )
}

export default function CardFolder(props: ICardFilterProps) {
    const { folders = [], expand = false } = props;
    console.log(expand)
    const { t } = useTranslation(['coder']);

    return (
        <Card className="w-full">
            <CardTitle> {t('folder', 'Folder')}</CardTitle>
            <CardContent className=" flex flex-row flex-wrap justify-center">
                <FolderList folders={folders} expand={expand} />
            </CardContent>
        </Card>
    )
}
