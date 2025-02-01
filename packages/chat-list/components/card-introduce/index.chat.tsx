import React from 'react';
import useChatState from 'chat-list/hook/useChatState'
import { useTranslation } from 'react-i18next'



export default function ToolList() {
    const { t } = useTranslation(['base', 'tool']);
    const { plugin, setAgentTools, setPlaceholder } = useChatState();

    const onSelect = (id: string) => {
        const tip = t(`tool:${id}.tip`, '');
        setPlaceholder(tip);
        setAgentTools([{ id, name: id, enable: true }]);
    }

    return (
        <div className='flex flex-col mb-96 w-full text-sm '>
            <p className=' py-1 text-sm'>
                {t('sheet.agent.sally.choose_tool')}
            </p>
            <div className='grid grid-cols-2 gap-2 mt-1 '>
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
