import React, { } from 'react';

import {
    Card,
    CardContent,
    // RadioGroup,
} from "chat-list/components/ui/card";
import { Presentation } from 'chat-list/tools/slide/create/generate_ppt_by_step_v3/util';
import CatalogConfirm from 'chat-list/components/catalog-confirm';

interface Chapter {
    id: string;
    content: string;
    type?: 'list' | 'table' | 'chart';
}

interface ChapterManagerProps {
    catalog?: Presentation;
    addImages?: boolean;
    reference?: string;
    onConfirm?: (list: Chapter[]) => void;
    language?: string;
}

const ChapterManager: React.FC<ChapterManagerProps> = (props: ChapterManagerProps) => {
    const { catalog, onConfirm, reference, addImages = true, language } = props;

    return (
        <Card className="w-full ">
            {/* <CardTitle>Outline</CardTitle> */}
            <CardContent>
                <CatalogConfirm
                    catalog={catalog}
                    reference={reference}
                    addImages={addImages}
                    language={language}
                />
            </CardContent>
        </Card>
    );
};

export default ChapterManager;