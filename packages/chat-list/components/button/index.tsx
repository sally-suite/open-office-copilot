
import React, { useEffect, useState } from 'react';
import { Button as ButtonComponent, ButtonProps } from 'chat-list/components/ui/button';
import { Loader2, LucideIcon } from 'lucide-react';
import { cn } from 'chat-list/lib/utils';

interface ILogButton extends ButtonProps {
  type?: "button" | "submit" | "reset";
  loading?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  icon?: LucideIcon;
  iconClassName?: string;
  action?: string;
  children?: React.ReactNode;
  variant?: "secondary" | "default" | "destructive" | "outline" | "ghost" | "link";
  className?: string;
}

export default function Button(props: ILogButton) {
  const { type = 'button', action = '', iconClassName = '', loading, icon, variant = 'default', onClick, children, className = '', ...rest } = props;
  const [waiting, setWaiting] = useState(loading);
  const onBtnClick: React.MouseEventHandler<HTMLButtonElement> = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    try {
      setWaiting(true);
      //   logEvent(action);
      await onClick?.(e);
    } finally {
      setWaiting(false);
    }
  };
  useEffect(() => {
    setWaiting(loading);
  }, [loading]);
  const Icon = icon;
  return (
    <ButtonComponent
      type={type}
      disabled={waiting}
      onClick={onBtnClick}
      className={cn(['w-full h-8 sm:w-28 flex flex-row justify-center', className])}
      variant={variant}
      {...rest}
    >
      {
        waiting && <Loader2 height={16} width={16} className={cn('rotate shrink-0 ', iconClassName)} />
      }
      {
        !waiting && Icon && <Icon height={16} width={16} className={cn('shrink-0', iconClassName)} />
      }

      {
        children && (
          <span className='mx-1 flex flex-row items-center'>
            {children}
          </span>
        )
      }
    </ButtonComponent>
  );
}

export {
  Button
};