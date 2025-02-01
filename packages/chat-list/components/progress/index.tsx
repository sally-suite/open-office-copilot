import { cn } from 'chat-list/lib/utils';
import React from 'react';

interface IProgressBarProps {
    className?: string;
    percentage: number;
}

const ProgressBar = ({ percentage, className }: IProgressBarProps) => {
    return (
        <div className={cn("h-1 w-full bg-gray-300  rounded-md overflow-hidden", className)}>
            <div
                className="h-full bg-primary transition-all"
                style={{ width: `${percentage}%` }}
            ></div>
        </div>
    );
};

export default ProgressBar;
