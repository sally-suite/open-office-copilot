import React from 'react';
import useChatState from 'chat-list/hook/useChatState';
import { useTranslation } from 'react-i18next';
import { buildChatMessage } from 'chat-list/utils';
import Button from '../button';
import { HelpCircle, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Tooltip from '../tooltip';

export default function CardPrompts() {
    const { t } = useTranslation(['base', 'tool']);
    const { sendMsg, prompts, user } = useChatState();
    const navigate = useNavigate();
    const onSelect = async (item: any) => {
        sendMsg(buildChatMessage(item.prompt, 'text', 'user'));
    }
    const onAdd = async () => {
        navigate('/prompt-manage');
    }
    if (user.state === 'anonymous') {
        return null;
    }
    return (
        <div className='flex flex-col text-sm mt-4 mb-96'>
            <h3 className='py-1 text-base flex flex-row items-center'>
                {t('common.prompt')}
                <Tooltip className='' tip={t('common.prompt_tip', 'Here are your saved prompts. Click to quickly send them to Sally.')}>
                    <HelpCircle className='text-gray-500 ml-1' height={16} width={16} />
                </Tooltip>
            </h3>
            <div className='grid grid-cols-1 gap-2 mt-1'>
                <div className='grid grid-cols-2 sm:grid-cols-4 gap-1 mt-2 '>
                    {
                        prompts.map((item, i) => {
                            return (
                                <div
                                    className='flex items-center justify-center py-1 px-1 text-center cursor-pointer rounded-xl border border-slate-200 bg-white select-none hover:bg-slate-100 hover:border-slate-100 transform transition-transform duration-200 hover:scale-102 active:scale-[98%] overflow-hidden line-clamp-2'
                                    key={i}
                                    onClick={onSelect.bind(null, item)}
                                >
                                    {item.name}
                                </div>
                            );
                        })
                    }
                </div>
            </div>
            <div className='w-full flex justify-center mt-4'>
                <Button icon={Plus} onClick={onAdd} variant='outline' >
                    {t('common.add_prompt')}
                </Button>
            </div>
        </div>
    );
}
