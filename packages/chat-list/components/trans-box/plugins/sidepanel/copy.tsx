import React from 'react';
import { copyByClipboard } from 'chat-list/utils';
import { Check, Copy } from 'lucide-react';
import { IPluginComponentProps } from '../types';



export default function CodeCopyBtn(props: IPluginComponentProps) {
  const { selectedText, className = '', } = props;
  const [copyOk, setCopyOk] = React.useState(false);
  const handleClick = () => {
    copyByClipboard(selectedText);

    setCopyOk(true);
    setTimeout(() => {
      setCopyOk(false);
    }, 1000);
  };
  return (
    <>
      {
        copyOk && <Check height={16} width={16} color={copyOk ? 'green' : ''} />
      }
      {
        !copyOk && <Copy onClick={handleClick} height={16} width={16} />
      }
    </>
  );
}
