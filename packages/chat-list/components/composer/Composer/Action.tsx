import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from 'chat-list/lib/utils';
import Tooltip from 'chat-list/components/tooltip';
import Avatar from 'chat-list/components/avatars';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  iconClassName?: string;
  label?: string;
  color?: 'primary';
  variant?: 'text' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  block?: boolean;
  icon?: string | LucideIcon;
  loading?: boolean;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

export const Action = (props: IconButtonProps) => {
  const { icon, title, className, iconClassName = '', children, ...rest } = props;
  if (!title) {
    return (
      <div className={cn(["flex flex-row items-center justify-center h-7 w-6 text-gray-500", className])} data-action-icon={props.icon} {...rest}>
        {
          icon && (
            <span className='cursor-pointer ' >
              <Avatar icon={icon} className={`${iconClassName}`} height={18} width={18} />
            </span>
          )
        }
        {children}
      </div>
    );
  }
  return (
    <Tooltip tip={title}>
      <div className={cn(["flex flex-row items-center justify-center h-7 w-6 text-gray-500", className])} data-action-icon={props.icon} {...rest}>
        {
          icon && (
            <span className='cursor-pointer ' >
              <Avatar icon={icon} className={`${iconClassName}`} height={18} width={18} />
            </span>
          )
        }
        {children}
      </div>
    </Tooltip>
  );
};
