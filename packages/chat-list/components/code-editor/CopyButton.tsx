import React from 'react';
import IconButton from './IconButton';
import { copyByClipboard } from 'chat-list/utils';

interface ICopyBtnProps {

  text?: string;
  className?: string;
  content: string;
  type?: 'html' | 'text';
  children?: React.ReactNode;
}

export default function CodeCopyBtn(props: ICopyBtnProps) {
  const { text, type = 'html', content, className = '', children } = props;
  const [copyOk, setCopyOk] = React.useState(false);
  const handleClick = async () => {
    // navigator.clipboard.writeText(children[0].props.children[0]);
    // navigator.clipboard.writeText(content);
    if (type === 'html') {
      await copyByClipboard(content, content)
    } else {
      await copyByClipboard(content)
    }

    setCopyOk(true);
    setTimeout(() => {
      setCopyOk(false);
    }, 1000);
  };
  return (
    <IconButton
      className={className}
      name={copyOk ? 'Check' : 'Copy'}
      onClick={handleClick}
    >
      {children || text || 'Copy'}
    </IconButton>
  );
}
