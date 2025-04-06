import React from 'react';
import { copyByClipboard } from 'chat-list/utils';
import { Check, Copy } from 'lucide-react';

interface ICopyButtonProps {
    content?: string;
    width?: number;
    height?: number;
}

export default function CodeCopyBtn(props: ICopyButtonProps) {
    const { content, width = 16, height = 16, } = props;
    const [copyOk, setCopyOk] = React.useState(false);
    const handleClick = () => {
        copyByClipboard(content);

        setCopyOk(true);
        setTimeout(() => {
            setCopyOk(false);
        }, 1000);
    };
    return (
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
