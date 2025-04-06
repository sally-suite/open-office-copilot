import React, { useMemo, useState } from 'react'
import { Check, Copy, FileOutput, } from 'lucide-react';
import IconButton from 'chat-list/components/icon-button'

import { buildHtml, copyByClipboard } from 'chat-list/utils';
import { insertText, replaceText } from 'chat-list/utils/writing';

import { useTranslation } from 'react-i18next';
// import rehypeSanitize from 'rehype-sanitize'
// import docApi from '@api/doc';

export const Code = (props: any) => {
    const { children, selectedRange } = props;
    const codeProps = children[0].props;
    const script: string = codeProps.children[0];

    const lng = useMemo(() => {
        const codeClass = codeProps.className;
        const match = /language-(\w+)/.exec(codeClass || '')
        const lng = match ? match[1] : '';
        return lng;
    }, [])
    const [copyOk, setCopyOk] = React.useState(false);

    const [expand, setExpand] = useState(false);
    const { t } = useTranslation('side')


    const onInsertCell = async () => {
        // await docApi.insertText(script);
        const text = `\`\`\`${lng}\n${script}\n\`\`\``;
        const html = await buildHtml(text, true)
        await insertText(selectedRange, html, 'html');
    };

    const onReplace = async () => {
        const text = `\`\`\`${lng}\n${script}\n\`\`\``;
        const html = await buildHtml(text, true)
        await replaceText(selectedRange, html, 'html');
    }

    const handleClick = async () => {

        // console.log(html)
        await copyByClipboard(script, `<pre>${script}</pre>`);
        setCopyOk(true);
        setTimeout(() => {
            setCopyOk(false);
        }, 1000);
    };
    const toogleExpand = () => {
        setExpand(!expand);

    }
    // if (!copyCodeBtn) {
    //     return <pre className='bg-slate-700 p-1'>{children}</pre>;
    // }



    const renderToolbar = () => {
        return (
            <div className='flex flex-row mt-1 '>
                <IconButton
                    onClick={onReplace}
                    className=' w-auto mr-1 px-1 py-3 '
                    icon={FileOutput}
                >
                    {t('replace')}
                </IconButton>
                <IconButton
                    onClick={onInsertCell}
                    className=' w-auto mr-1 px-1 py-3 '
                    icon={FileOutput}
                >
                    {t('insert')}
                </IconButton>
                <IconButton
                    onClick={handleClick}
                    className=' w-auto px-1 py-3 mr-1'
                    icon={(
                        copyOk ? Check : Copy
                    )}
                >
                    {t('copy')}
                </IconButton>
            </div>
        )
    }

    return (
        <div
            className="relative py-2 rounded"
            style={{
                width: 'auto'
            }}
        >
            <pre className='bg-slate-700 p-1 rounded'>
                <code>
                    {children[0].props.children}
                </code>
            </pre>
            {
                renderToolbar()
            }
        </div>
    );
};

export default Code;