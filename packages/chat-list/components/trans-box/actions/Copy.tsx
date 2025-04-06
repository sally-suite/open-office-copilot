import React, { useRef } from 'react'
import BaseAction from './base-action';
import { Copy } from 'lucide-react';
import { buildHtml, copyByClipboard } from 'chat-list/utils';
import { useTranslation } from 'react-i18next';

interface IReplaceActionProps {
    text?: string;
    type?: 'text' | 'html';
}


export default function ReplaceAction(props: IReplaceActionProps) {
    const { text = '', type = 'html' } = props;
    const { t } = useTranslation('side')

    const onCopy = async () => {
        if (type == 'html') {
            const html = await buildHtml(text, true);
            await copyByClipboard(text, html);
        } else {
            await copyByClipboard(text);
        }
    }
    return (
        <BaseAction icon={Copy} tip={t("copy")} onClick={onCopy} />
    )
}
