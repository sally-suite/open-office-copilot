import React from 'react';
import useChatState from 'chat-list/hook/useChatState'

import { useTranslation } from 'react-i18next'
import { cn } from 'chat-list/lib/utils';
import Avatar from '../avatars';
import { useNavigate } from 'react-router-dom';

interface IToolListProps {
    introduction: string;
    className?: string;
}


export default function ToolList(props: IToolListProps) {
    const { introduction } = props;
    const { t } = useTranslation(['base', 'tool']);
    const { plugins, plugin } = useChatState();
    const navigate = useNavigate();
    const onSelect = (id: string) => {

        navigate(`/${id}`)

    }

    return (
        <div className='flex flex-col text-sm'>
            <p className='markdown p-1'>
                {introduction}
            </p>
            <p className='text-base mt-3 mb-1'>
                {t('common.agents', 'Agents')}:
            </p>
            <div className='grid grid-cols-4 gap-2 mt-1'>
                {
                    plugins?.filter(p => p.action !== plugin.action).map((plg) => {
                        return (
                            <div
                                className={cn(
                                    'flex flex-col items-start p-2 max-w-[200px] rounded-md hover:bg-gray-100 cursor-pointer border',
                                )}
                                key={plg.action}
                                onClick={onSelect.bind(null, plg.action)}
                            >
                                <div
                                    className=' font-medium overflow-hidden '
                                >
                                    <Avatar icon={plg.icon} name={plg.name} />
                                    {/* {plg.name} */}
                                </div>
                                <div className=' overflow-hidden text-gray-700 text-sm pt-2'>
                                    {plg.shortDescription || plg.description}
                                </div>
                            </div>
                        )
                    })
                }
            </div>

        </div>

    )
}
