import React, { useRef } from 'react'
import BaseAction from './base-action';
import { Replace } from 'lucide-react';
import { SelectedRange } from '../plugins/types';
import { replaceText } from 'chat-list/utils/writing';
import { useTranslation } from 'react-i18next';
import { buildHtml } from 'chat-list/utils';

interface IReplaceActionProps {
    selectedRange: SelectedRange;
    text?: string;
    type?: 'text' | 'html';
    onSuccess?: () => void;
}


export default function ReplaceAction(props: IReplaceActionProps) {
    const { selectedRange, text = '', onSuccess } = props;
    const { t } = useTranslation('side')

    const onReplace = async () => {
        let content = text;
        let type: 'text' | 'html' = 'text';
        if (selectedRange instanceof Range) {
            content = await buildHtml(text, true)
            type = 'html'
        }
        await replaceText(selectedRange, content, type);
        onSuccess?.();
    }
    return (
        <BaseAction icon={Replace} tip={t('replace')} onClick={onReplace} />
    )
}
