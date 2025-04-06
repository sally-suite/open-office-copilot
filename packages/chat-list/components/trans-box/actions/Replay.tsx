import React, { useRef } from 'react'
import BaseAction from './base-action';
import { RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface IReplaceActionProps {
    onClick?: () => void;
}


export default function ReplaceAction(props: IReplaceActionProps) {
    const { onClick } = props;
    const { t } = useTranslation('side')

    return (
        <BaseAction icon={RefreshCw} tip={t("regenerate")} onClick={onClick} />
    )
}
