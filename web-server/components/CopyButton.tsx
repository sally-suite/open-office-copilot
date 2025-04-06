'use client';

import React from 'react'
import { Button } from './ui/button';
import { copyByClipboard } from '@/utils'
import { Copy, Check } from 'lucide-react'
interface ICopyButtonProps {
    content: string;
    children?: React.ReactNode;
}
export default function CopyButton(props: ICopyButtonProps) {
    const { content, children } = props;

    const [copyOk, setCopyOk] = React.useState(false);
    const onCopy = () => {
        copyByClipboard(content, content);

        setCopyOk(true);
        setTimeout(() => {
            setCopyOk(false);
        }, 1000);
    };
    return (
        <div className='flex flex-row rounded-full cursor-pointer items-center' onClick={onCopy}>
            {copyOk ? <Check className='mr-2 h-4 w-4' /> : <Copy className='mr-2 h-4 w-4' />}
            {
                typeof children === 'undefined' || 'Copy'
            }
        </div>
    )
}
