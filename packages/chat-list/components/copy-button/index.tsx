import React from 'react';
import { copyByClipboard } from '../../utils';
import { Check, Copy } from 'lucide-react';

interface ICopyBtnProps {
  type?: 'text' | 'html';
  className?: string;
  content: string;
  height?: number;
  width?: number;
  onCopy?: () => void;
}

export default function CodeCopyBtn(props: ICopyBtnProps) {
  const { content, className = '', type = 'text', width = 14, height = 14, onCopy } = props;
  const [copyOk, setCopyOk] = React.useState(false);
  const handleClick = () => {
    // navigator.clipboard.writeText(children[0].props.children[0]);
    if (type === 'text') {
      // navigator.clipboard.writeText(content);
      copyByClipboard(content, content);
    } else if (type === 'html') {
      // const blob = new Blob([content], {
      //   type: 'text/html',
      // });
      // navigator.clipboard.write([
      //   new ClipboardItem({
      //     [blob.type]: blob,
      //   }),
      // ]);
      copyByClipboard(content, content);
    }

    setCopyOk(true);
    setTimeout(() => {
      setCopyOk(false);
      if (onCopy) {
        onCopy();
      }
    }, 1000);
  };
  return (
    // <Icon
    //   className={`h-full w-full ${className}`}
    //   style={{
    //     margin: 0,
    //     padding: 0,
    //     fill: copyOk ? 'green' : '',
    //   }}
    //   onClick={handleClick}
    //   type={copyOk ? 'check' : 'copy'}
    // />
    <>
      {
        copyOk && <Check height={height} width={width} color={copyOk ? 'green' : ''} />
      }
      {
        !copyOk && <Copy onClick={handleClick} height={height} width={width} />
      }
    </>
  );
}
