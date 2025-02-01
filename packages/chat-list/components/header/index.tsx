import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { cn } from 'chat-list/lib/utils';

interface HeaderProps {
    title?: string;
    onBack?: () => void;
    className?: string;
    children?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ title, onBack, className, children }) => {
    return (
        <header className={cn([" p-1  flex items-center justify-between bg-gray-100 rounded-br-sm rounded-bl-sm ", className])}>
            {
                onBack && (
                    <div className='mr-2'>
                        <ChevronLeft className="text-2xl" onClick={onBack} style={{ cursor: 'pointer' }}>
                        </ChevronLeft >
                    </div>
                )
            }
            {
                title && (
                    <div className='flex-1 flex flex-row items-center justify-center'>
                        <span className=" text-base ">{title}</span>
                    </div>
                )
            }
            {
                children && (
                    <div className='flex-1 flex flex-row' >
                        {children}
                    </div>
                )
            }

        </header>
    );
};

export default Header;
