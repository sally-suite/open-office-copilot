import React, { } from 'react';
import useChatState from 'chat-list/hook/useChatState';
import { cn } from 'chat-list/lib/utils';
import { IChatPlugin } from 'chat-list/types/plugin';
import Avatar from 'chat-list/components/avatars';

interface IAgentListProps {
    hideName?: boolean;
    onSelect?: (agent: IChatPlugin) => void;
}

export default function AgentList(props: IAgentListProps) {
    const { hideName = false, onSelect: onAgentSelect } = props;
    const { plugins, plugin, } = useChatState();
    const onSelect = (plg: IChatPlugin) => {

        if (onAgentSelect) {
            onAgentSelect(plg)
        }
    }
    return (
        <div className='flex flex-col p-2 pt-0 space-y-1 w-full'>
            {plugins.map((item) => {
                return (
                    <div key={item.conversationId} className={cn(
                        'flex flex-row items-center p-2 hover:bg-gray-100 cursor-pointer rounded-md ',
                        plugin.action == item.action ? 'bg-gray-100 ' : ''
                    )}
                        onClick={onSelect.bind(null, item)}
                    >
                        <Avatar icon={item.icon} height={16} width={16} />
                        {
                            !hideName && (
                                <span className='ml-1 text-sm'>
                                    {item.name}
                                </span>
                            )
                        }
                    </div>
                )
            })}
        </div>
    )
}
