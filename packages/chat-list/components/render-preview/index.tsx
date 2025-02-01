import useChatState from 'chat-list/hook/useChatState';
import { cn } from 'chat-list/lib/utils';
import { X } from "lucide-react"
import React, { useState, useEffect } from 'react'

export default function RenderPreview() {
    const { preview, setPreview } = useChatState();
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        let timer: any;
        if (preview) {
            // 设置一个延迟，等待动画完成后再显示内容
            timer = setTimeout(() => setShowContent(true), 300); // 300ms 与 CSS transition 时间相匹配
        } else {
            setShowContent(false);
        }
        return () => clearTimeout(timer);
    }, [preview]);

    return (
        <div
            className={cn(
                `flex flex-col h-screen  transition-all border-l duration-300 ease-in-out`,
                preview ? 'opacity-100 flex-1 overflow-auto ' : 'opacity-0 hidden overflow-hidden',
                preview?.className
            )}>
            <div className='flex justify-between px-2 py-1 bg-gray-100'>
                <div className='text-sm'>
                    {preview?.title}
                </div>
                <button
                    onClick={() => setPreview(null)}
                    className='text-gray-600 hover:text-gray-800'
                >
                    <X height={16} width={16} />
                </button>
            </div>
            <div className='flex-1 overflow-auto'>
                {showContent && preview?.component}
            </div>
        </div>
    )
}
