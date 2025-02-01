import { Loader2 } from 'lucide-react';
import React from 'react';
import { cn } from 'chat-list/lib/utils';
export default function Loading({ className, text }: { className?: string, text?: string }) {
  return (
    <div className={cn('w-full h-screen flex flex-col justify-center items-center', className)}>
      {/* <Icon type="spinner" spin className=" text-2xl" /> */}
      <Loader2 height={20} width={20} className='rotate' />
      {
        text && <span className='text-sm'>{text}</span>
      }
    </div>
  );
}

export {
  Loading
}