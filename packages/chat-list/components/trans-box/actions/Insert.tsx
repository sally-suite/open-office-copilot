import React from 'react'
import BaseAction from './base-action';
import { ArrowLeftToLine } from 'lucide-react';
import { SelectedRange } from '../plugins/types';
import { insertText } from 'chat-list/utils/writing';
import { useTranslation } from 'react-i18next';
import { buildHtml } from 'chat-list/utils';

interface IReplaceActionProps {
    selectedRange: SelectedRange;
    text?: string;
    onSuccess?: () => void;
    type?: 'text' | 'html';
}


export default function ReplaceAction(props: IReplaceActionProps) {
    const { selectedRange, text = '', onSuccess, } = props;
    const { t } = useTranslation('side')

    const onReplace = async () => {
        let content = text;
        let type: 'text' | 'html' = 'text';
        if (selectedRange instanceof Range) {
            content = await buildHtml(text, true)
            type = 'html'
        }
        await insertText(selectedRange, content, type);
        onSuccess?.();
    }
    return (
        <BaseAction icon={ArrowLeftToLine} tip={t("insert")} onClick={onReplace} />
    )
}
