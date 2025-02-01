import useChatState from 'chat-list/hook/useChatState';
import Tooltip from 'chat-list/components/tooltip';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquarePlus } from 'lucide-react';
export default function index() {
    const { t } = useTranslation(['base']);
    const { messages, newChat } = useChatState();
    return (
        <div>
            {
                messages.length >= 1 && (
                    <div
                        className='h-6 text-sm flex flex-row items-center rounded-full border px-1 bg-white text-gray-500 '
                        onClick={newChat}>
                        <Tooltip tip={t('base:common.new_chat')}>
                            <MessageSquarePlus height={16} width={16} className='text-gray-500' />
                        </Tooltip>
                    </div>
                )
            }
        </div>
    );
}
