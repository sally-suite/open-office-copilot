import React from 'react';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface IToolMessageProps {
    status: 'running' | 'success' | 'failed';
    content: string;
}

export default function ToolMessage(props: IToolMessageProps) {
    const { status, content } = props;
    return (
        <div className='flex flex-row items-center p-3'>
            <span className='w-5 h-5 shrink-0'>
                {
                    status === 'running' && (

                        <Loader2 height={20} width={20} className='rotate ' />

                    )
                }
                {
                    status === 'success' && (
                        <CheckCircle2 height={20} width={20} className="text-primary " />
                    )
                }
                {
                    status === 'failed' && (
                        <AlertCircle height={20} width={20} className="text-red-500" />
                    )
                }
            </span>
            <span className='ml-1 text-sm'>
                {content}
            </span>
        </div>
    );
}
