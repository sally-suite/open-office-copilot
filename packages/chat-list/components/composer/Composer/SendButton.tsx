import React from 'react';
import IconButton from 'chat-list/components/icon';
import { cn } from 'chat-list/lib/utils';

interface SendButtonProps {
  disabled?: boolean;
  onClick: (e: React.MouseEvent) => void;
  className?: string;
}

export const SendButton = ({ disabled, onClick, className }: SendButtonProps) => {
  return (
    <div className={cn([
      "h-7 flex flex-col justify-center items-center ",
      disabled ? 'cursor-not-allowed' : 'cursor-pointer',
      className
    ])}>
      <IconButton
        name="plane"
        className='text-primary'
        style={{
          // color: '#127934',
          height: 18,
          width: 18,
          opacity: disabled ? 0.5 : 1,
        }}
        onClick={!disabled ? onClick : null}
      ></IconButton>
    </div>
  );
};
