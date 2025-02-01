// import { cn } from 'chat-list/lib/utils';
import Icon from '../icon';
import React from 'react';

export default function Loading({ className }: { className?: string }) {
  return (
    <div className="fadeInOut">
      <Icon
        name="logo"
        style={{
          height: 60,
          width: 60,
        }}
      />
    </div>
  );
}
