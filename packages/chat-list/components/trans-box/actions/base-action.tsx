import { Check, Loader2, LucideIcon } from 'lucide-react';
import React, { useState } from 'react';
import Tooltip from 'chat-list/components/tooltip'
import useDir from '../store/useDir';

interface IBaseActionProps {
    icon: LucideIcon;
    tip?: string;
    onClick?: () => void;
    size?: number;
}

type Status = 'normal' | 'loading' | 'done';

export default function BaseAction(props: IBaseActionProps) {
    const { onClick, icon, tip, size = 16 } = props;
    const { dir } = useDir();
    const [status, setStatus] = useState<Status>('normal')
    const onActionClick = async (_e: any) => {
        setStatus('loading');
        try {
            await onClick?.();
            setStatus('done');
            setTimeout(() => {
                setStatus('normal');
            }, 1000)
        } catch (e) {
            setStatus('normal');
        }
    }
    const Icon = icon;
    return (
        // <Tooltip className='' tip={tip} align='center' side='top'>
        <div dir={dir} className='h-6 w-auto flex flex-row items-center justify-center text-sm m-1 select-none cursor-pointer' onClick={onActionClick}>
            {
                status == 'normal' && <Icon height={size} width={size} />
            }
            {
                status == 'loading' && <Loader2 height={size} width={size} className='rotate' />
            }
            {
                status == 'done' && <Check height={size} width={size} className='text-green-500' />
            }
            <span className='ml-1'>
                {tip}
            </span>
        </div>
        // </Tooltip>
    )
}
