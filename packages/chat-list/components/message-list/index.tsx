// MessageList.tsx
import React, { useEffect, useRef, useState } from 'react';
import Message from '../message';
import { IChatMessage } from 'chat-list/types/message';
import { cn } from 'chat-list/lib/utils';
import { ChevronsDown } from 'lucide-react';
import { throttle } from 'chat-list/utils/common';
import { getLocalStore, setLocalStore } from 'chat-list/local/local';

interface MessageListProps {
    className?: string;
    messages: IChatMessage[];
    onClear?: () => void;
    renderMessageContent?: (content: IChatMessage) => React.ReactNode;
}

function getToBottom(el: HTMLElement) {
    return el.scrollHeight - el.scrollTop - el.offsetHeight;
}

function isNearBottom(el: HTMLElement, n: number) {
    const offsetHeight = Math.max(el.offsetHeight, 600);
    return getToBottom(el) < offsetHeight * n;
}

function isDivNearBottom(targetDiv: HTMLElement) {

    // 判断滚动条是否接近底部（可以根据实际情况调整阈值，比如设为10）
    const threshold = 600;
    return targetDiv.scrollHeight - targetDiv.scrollTop <= targetDiv.clientHeight + threshold;
}


const scrollToBottom = throttle((messagesEndRef: any, wrapper: any) => {
    if (!messagesEndRef.current) {
        return;
    }
    if (messagesEndRef.current) {
        if (!wrapper.current) {
            return;
        }
        wrapper.current.scroll({
            top: wrapper.current.scrollHeight,
            behavior: 'smooth'
        });
    }
    return;
}, 300)


const MessageList: React.FC<MessageListProps> = ({ className, onClear, messages, renderMessageContent }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const wrapper = useRef(null);
    const [showBackBottom, setShowBackBottom] = useState(false);
    const [newCount, setNewCount] = useState(0);
    const newCountRef = useRef(newCount);

    const lastMessage = messages[messages.length - 1];
    const clearBackBottom = () => {
        setNewCount(0);
        setShowBackBottom(false);
    };
    const checkShowBottomRef = useRef(
        throttle((el: HTMLElement) => {
            setLocalStore('scoll-position', el.scrollTop);
            if (isNearBottom(el, 1)) {
                if (newCountRef.current) {
                    // 如果有新消息，离底部0.5屏-隐藏提示
                    if (isNearBottom(el, 0.5)) {
                        clearBackBottom();
                    }
                } else {
                    setShowBackBottom(false);
                }
            } else {
                // 3屏+显示回到底部
                setShowBackBottom(true);
            }
        }),
    );

    const handleScroll = (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
        checkShowBottomRef.current(e.target);

        // if (onScroll) {
        //   onScroll(e);
        // }
    };

    const showNewMessage = () => {
        scrollToBottom(messagesEndRef, wrapper);

        setTimeout(() => {
            setShowBackBottom(false);
        }, 300);
    }

    const clearMessages = () => {
        onClear?.();
        setShowBackBottom(false);
    }

    useEffect(() => {
        // if (!wrapper.current) {
        //     return;
        // }
        if (!lastMessage) {
            return;
        }
        if (lastMessage.position === 'right') {
            // console.log('right')
            // 自己发的消息，强制滚动到底部
            scrollToBottom(messagesEndRef, wrapper);
            setShowBackBottom(false);
        } else if (isNearBottom(wrapper.current, 1)) {
            // console.log('isNearBottom')
            scrollToBottom(messagesEndRef, wrapper);
            setShowBackBottom(false);
        } else {
            setNewCount((c) => c + 1);
            setShowBackBottom(true);
        }
        // console.log(lastMessage)
        // scrollToBottom();
    }, [lastMessage]);
    useEffect(() => {
        newCountRef.current = newCount;
    }, [newCount]);
    useEffect(() => {
        const scrollTop = getLocalStore('scoll-position');
        if (scrollTop) {
            wrapper.current?.scrollTo({
                top: scrollTop,
                behavior: 'auto'
            });
        }
    }, [])
    return (
        <div className={cn('message-list pb-28 relative', className)} ref={wrapper} onScroll={handleScroll} >
            {messages.map((message, index) => (
                <Message
                    key={index}
                    message={message}
                    timestamp={message.createdAt + ''}
                    renderMessageContent={renderMessageContent}
                />
            ))}
            <div ref={messagesEndRef} />
            {
                showBackBottom && (
                    <div className=' rounded-full border w-8 h-8 z-20 shrink-0  sticky left-1/2 -bottom-24 -translate-x-1/2 flex items-center justify-center bg-white shadow-md cursor-pointer' onClick={showNewMessage}>
                        <ChevronsDown height={16} width={16} className='text-gray-500' />
                    </div>
                )
            }
            {/* {
                messages.length >= 1 && (
                    <div className='float-button z-10' onClick={clearMessages}>
                        <Tooltip tip="Clean up messages and start new chat">
                            <span className='ml-1'>
                                {t('base:common.new_chat')}
                            </span>
                        </Tooltip>
                    </div>
                )
            } */}
        </div>
    );
};

export default MessageList;
