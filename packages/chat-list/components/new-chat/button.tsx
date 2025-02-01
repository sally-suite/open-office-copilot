import React from 'react';
import useChatState from 'chat-list/hook/useChatState';
import { useTranslation } from 'react-i18next';
import { cn } from 'chat-list/lib/utils';
import Button from '../button';

export default function index() {
    const { newChat, messages } = useChatState();
    const { t, } = useTranslation('base');
    return (

        <div className={cn(
            'flex flex-row justify-end items-center w-full px-1'
        )}>
            {
                messages.length > 0 && (
                    <Button className='w-20 h-6' variant='secondary' onClick={newChat} >
                        {t('base:common.new_chat')}
                    </Button>
                )
            }

        </div>

    );
}
