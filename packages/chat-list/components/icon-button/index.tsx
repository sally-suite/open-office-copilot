import { Loader2, LucideIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import Tooltip from 'chat-list/components/tooltip';
import { cn } from 'chat-list/lib/utils';

export interface IconButtonProps {
    disabled?: boolean;
    loading?: boolean;
    title?: string;
    icon?: LucideIcon | React.ReactNode;
    onClick?: (e?: any) => void;
    className?: string;
    children?: React.ReactNode;
    style?: React.StyleHTMLAttributes<HTMLSpanElement>
}

export default function IconButton(props: IconButtonProps) {
    const { disabled, icon, loading, title, onClick, className = '', children, ...rest } = props;
    const [waiting, setWaiting] = useState(loading);
    const onBtnClick = async (e: any) => {
        try {
            if (disabled) {
                return;
            }
            e.preventDefault();
            setWaiting(true);
            //   logEvent(action);
            await onClick?.(e);
        } finally {
            setWaiting(false);
        }
    };
    useEffect(() => {
        setWaiting(loading)
    }, [loading])
    const Icon: any = icon;
    const child = (
        <span
            className={cn([
                `flex justify-center items-center w-5 h-5 flex-shrink-0 border bg-white rounded hover:bg-gray-100`,
                className,
                disabled ? "cursor-not-allowed" : "cursor-pointer"
            ])}
            onClick={onBtnClick}
            {...rest}
        >
            {waiting && <Loader2 height={14} width={14} className='rotate' />}
            {!waiting && typeof Icon.displayName === 'string' && <Icon height={14} width={14} />}
            {!waiting && typeof Icon.displayName === 'undefined' && Icon}
            {
                children &&
                <span className='ml-1 whitespace-nowrap overflow-hidden text-ellipsis'>{children}</span>
            }
        </span>
    )
    if (!title) {
        return child;
    }
    return (
        <Tooltip tip={title}>
            {child}
        </Tooltip>
    )
}
