import React, { useEffect, useState } from 'react'
import styles from './index.module.css';
import { Loader2, LucideIcon } from 'lucide-react';
import { cn } from 'chat-list/lib/utils';

interface IButtonProps {
    title?: string;
    icon?: LucideIcon;
    children?: React.ReactNode;
    loading?: boolean;
    disabled?: boolean;
    onClick?: (e?: any) => void;
    className?: string;

}

export default function Button(props: IButtonProps = {}) {
    const { loading, icon, disabled, onClick, children = '', className, ...rest } = props;
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

    return (
        <button className={cn('inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-7 px-2 py-1', className)} onClick={onBtnClick} disabled={disabled} {...rest}>
            {waiting && <Loader2 height={14} width={14} className={styles.rotate} />}
            {!waiting && Icon && <Icon height={14} width={14} />}
            {children}
        </button>
    )
}
