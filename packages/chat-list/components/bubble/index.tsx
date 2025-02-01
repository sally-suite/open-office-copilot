import { cn } from 'chat-list/lib/utils';
import React from 'react';
export interface BubbleProps {
  type?: string;
  content?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export default React.memo(function Bubble(props: BubbleProps) {
  const { type, content, children } = props;
  return (
    <div className={cn(`bubble`, type)}>
      {content && <p>{content}</p>}
      {children}
    </div>
  );
}); 