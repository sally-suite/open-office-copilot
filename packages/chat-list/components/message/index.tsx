import { cn } from 'chat-list/lib/utils';
import { IChatMessage } from 'chat-list/types/message';
import Typing from 'chat-list/components/typing'
import React, { useEffect, useState, memo } from 'react';
import ErrorBoundary from 'chat-list/components/error-boundary';

interface MessageProps {
    message: IChatMessage;
    timestamp: string;
    renderMessageContent?: (msg: IChatMessage) => React.ReactNode;
}

const Message: React.FC<MessageProps> = memo(({ message, timestamp, renderMessageContent }: MessageProps) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 50);
        return () => clearTimeout(timer);
    }, [timestamp]);

    if (message.type === 'typing') {
        return (
            <div className={cn([
                "message",
                message.position,
                "transition-all duration-300 ease-out transform",
                isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            ])}>
                <div className='message-main'>
                    <div className='message-inner'>
                        <Typing />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={cn([
            "message",
            message.position,
            "transition-all duration-300 ease-out transform",
            isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        ])}>
            <div className='message-main'>
                <div className='message-inner'>
                    <ErrorBoundary>
                        {renderMessageContent ? renderMessageContent(message) : <p>{message.content}</p>}
                    </ErrorBoundary>
                </div>
            </div>
        </div>
    );
});

Message.displayName = 'Message';

export default Message;