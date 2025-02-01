import React, { useContext, useMemo } from 'react';
import { FileOutput } from 'lucide-react';
import sheetApi from '@api/sheet';
import IconButton from 'chat-list/components/icon-button';
// import docApi from '@api/doc';
import { ChatContext } from 'chat-list/store/chatContext';
import docApi from '@api/doc';
import { useTranslation } from 'react-i18next';

// import rehypeSanitize from 'rehype-sanitize'


export const Code = ({ children }: any) => {
    const script: string = children[0];
    const { docType } = useContext(ChatContext);
    const { t } = useTranslation();

    const onInsertCell = async () => {
        if (docType === 'sheet') {
            await sheetApi.insertText(script);
        } else {
            await docApi.insertText(script);
        }
    };

    // if (!copyCodeBtn) {
    //     return <pre className='bg-slate-700 p-1'>{children}</pre>;
    // }

    const isInline = script.indexOf('\n') <= -1 && script.startsWith('=');

    const insertTitle = useMemo(() => {
        let tip = '';
        if (docType === 'doc') {
            tip = t('common.insert_to_doc');
        } else if (docType == 'sheet') {
            tip = t('common.insert_to_sheet');
        }
        return tip;
    }, []);
    return (
        <div
            className="inline-flex flex-row items-start relative py-2 rounded"
            style={{
                width: 'auto'
            }}
        >
            <code className='bg-slate-700 p-1 rounded'>
                {children}
            </code>
            <div className='flex flex-row items-center'>

                {
                    isInline && (
                        <>
                            {/* <IconButton
                                title="Copy"
                                onClick={handleClick}
                                className=' w-auto px-1 py-2 '
                                icon={(
                                    copyOk ? Check : Copy
                                )}
                            >
                            </IconButton> */}
                            <IconButton
                                title={insertTitle}
                                onClick={onInsertCell}
                                className=' w-auto px-1 py-2 ml-1 '
                                icon={FileOutput}
                            >

                            </IconButton>
                        </>
                    )
                }

            </div>
        </div>
    );
};

export default Code;