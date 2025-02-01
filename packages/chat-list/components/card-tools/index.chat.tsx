import React from 'react';
import useChatState from 'chat-list/hook/useChatState';

import { useTranslation } from 'react-i18next';
import { cn } from 'chat-list/lib/utils';

interface IToolListProps {
    introduction: string;
    className?: string;
}


export default function ToolList(props: IToolListProps) {
    const { className, introduction } = props;
    const { t } = useTranslation(['base', 'tool']);
    const { plugins, plugin, setAgentTools, setPlaceholder, agentTools } = useChatState();

    const onSelect = (id: string) => {

        // const checked = !!agentTools.find(p => p.id == id);
        // setAgentTools([])
        // if (!checked) {
        const tip = t(`tool:${id}.tip`, '');
        setPlaceholder(tip);
        setAgentTools([{ id, name: id, enable: true }]);
        // } else {
        //     setPlaceholder('');
        //     setAgentTools(agentTools.filter(item => item.id !== id))
        // }

    };

    const renderToolDescription = (id: string) => {
        // const tool = tools.find(p => p.name == id);
        return t(`tool:${id}.description`);
    };

    return (
        <div className='flex flex-col text-sm'>
            <p className='markdown p-1'>
                {introduction}
            </p>
            <p className='text-base mt-3 mb-1'>
                {t('common.tools', 'Tools')}:
            </p>
            <div className='grid grid-cols-4 gap-2 mt-1'>
                {
                    plugin.tools?.map((id) => {
                        return (
                            <div
                                className={cn(
                                    'flex flex-col items-start p-2  max-w-[200px] rounded-md hover:bg-gray-100 cursor-pointer border',
                                    // (agentTools.find(p => p.id == id)) ? 'border border-primary' : ''
                                )}
                                key={id}
                                onClick={onSelect.bind(null, id)}
                            >
                                <div
                                    className='font-medium overflow-hidden '
                                >
                                    {t(`tool:${id}`)}
                                </div>
                                <div className=' overflow-hidden text-gray-700 text-sm py-1'>
                                    {renderToolDescription(id)}
                                </div>
                            </div>
                        );
                    })
                }
            </div>

            {/* <p className='text-base mt-3 mb-1'>
                {t('common.agents', 'Agents')}:
            </p>
            <div className='grid grid-cols-4 gap-2 mt-1'>
                {
                    plugins?.filter(p => p.action !== plugin.action).map((plg) => {
                        return (
                            <div
                                className={cn(
                                    'flex flex-col items-start p-2  min-w-[160px] max-w-[200px] rounded-md hover:bg-gray-100 cursor-pointer border',
                                )}
                                key={plg.action}
                                onClick={onSelect.bind(null, plg.action)}
                            >
                                <div
                                    className=' font-medium overflow-hidden '
                                >
                                    {plg.name}
                                </div>
                                <div className=' overflow-hidden text-gray-500 text-sm'>
                                    {plg.shortDescription}
                                </div>
                            </div>
                        )
                    })
                }
            </div> */}

        </div>

    );
}
