import React from 'react';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "chat-list/components/ui/tooltip";

export interface ITooltipProps {
    tip: string | React.ReactNode;
    side?: "top" | "right" | "bottom" | "left";
    align?: "center" | "start" | "end";
    children?: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

export const TooltipComponent = (props: ITooltipProps) => {
    const { tip, children, className, onClick, align = 'center', side = 'top' } = props;
    return (
        <Tooltip>
            <TooltipTrigger asChild className={className} onClick={onClick}>
                {children}
            </TooltipTrigger>
            <TooltipContent align={align} side={side} >
                {
                    typeof tip === 'string' && (
                        <div className='max-w-[260px] flex-wrap font-normal' dangerouslySetInnerHTML={{
                            __html: tip
                        }} >
                        </div>
                    )
                }
                {
                    typeof tip === 'object' && tip
                }
            </TooltipContent>
        </Tooltip>
    );
};

export default TooltipComponent;