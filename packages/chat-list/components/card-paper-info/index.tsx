import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
import { setLocalStore } from 'chat-list/local/local';
import { cn } from 'chat-list/lib/utils';

interface ICardPaperInfo {
    icon: LucideIcon,
    content: string,
    papers?: any[]
}
export default function CardPaperInfo(props: ICardPaperInfo) {
    const { icon: Icon, content, papers } = props;
    const navigate = useNavigate();
    return (
        <div className='bubble p-4 rounded-md flex flex-row items-center text-sm cursor-pointer' onClick={() => {
            if (papers && papers.length > 0) {
                setLocalStore('paper-list', papers);
                navigate('/search-paper');
            }
        }}>
            <Icon height={20} width={20} />
            <span className={cn('ml-1', papers && papers.length > 0 ? 'underline underline-offset-2' : '')}>
                {content}
            </span>
        </div>
    );
}
