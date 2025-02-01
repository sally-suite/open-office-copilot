import React from 'react';
import useChatState from 'chat-list/hook/useChatState'

import { useTranslation } from 'react-i18next'

interface IToolListProps {
    introduction: string;
    className?: string;
}


export default function ToolList(props: IToolListProps) {
    const { introduction } = props;
    const { t } = useTranslation(['base', 'tool']);
    const { plugin, setAgentTools, setPlaceholder } = useChatState();

    const onSelect = (id: string) => {
        const tip = t(`tool:${id}.tip`, '');
        setPlaceholder(tip);
        setAgentTools([{ id, name: id, enable: true }]);
    }

    return (
        <div className='flex flex-col text-sm'>
            <p className='markdown p-1'>
                {introduction}
            </p>
            <p className='text-base mt-3 mb-1'>
                Tools
            </p>
            <div className='grid grid-cols-2 gap-2 mt-1'>
                {
                    plugin.tools?.map((id) => {
                        return (
                            <div
                                className='w-full p-1 rounded-full border text-center hover:bg-gray-100 cursor-pointer'
                                key={id}
                                onClick={onSelect.bind(null, id)}
                            >
                                {t(`tool:${id}`)}
                            </div>
                        )
                    })
                }
            </div>
        </div>

    )
}
