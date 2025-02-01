import React, { } from 'react';
import useChatState from 'chat-list/hook/useChatState';
import { cn } from 'chat-list/lib/utils';
import { IChatPlugin } from 'chat-list/types/plugin';
import Avatar from 'chat-list/components/avatars';
import Tooltip from 'chat-list/components/tooltip';

interface IAgentListProps {
    hideName?: boolean;
    onSelect?: (agent: IChatPlugin) => void;
}

export default function AgentList(props: IAgentListProps) {
    const { hideName = false, onSelect: onAgentSelect } = props;
    const { plugins, plugin, } = useChatState();
    const onSelect = (plg: IChatPlugin) => {
        // console.log(plugin)
        // if (plugin) {
        //     (plugin as any)['messages'] = messages;
        // }
        // const msgs = (plg as any)['messages'];
        // if (msgs) {
        //     resetList(msgs);
        // } else {
        //     resetList([]);
        // }
        // setMode('chat');
        // setPlugin(plg)
        if (onAgentSelect) {
            onAgentSelect(plg);
        }
    };
    return (
        <div className='flex flex-col p-0 w-16 pt-0 shadow-md items-center rounded-md overflow-hidden '>
            {plugins.map((item) => {
                return (
                    <div key={item.conversationId} className={cn(
                        'flex flex-row items-center h-16 w-16 justify-center hover:bg-gray-100 cursor-pointer ',
                        plugin.action == item.action ? 'bg-gray-100 ' : ''
                    )}
                        onClick={onSelect.bind(null, item)}
                    >
                        <Tooltip tip={item.name} side="right" align='center'>
                            <Avatar icon={item.icon} height={28} width={28} className=' hover:scale-125 transition-all duration-300 ease-in-out' />
                        </Tooltip>
                    </div>
                );
            })}
        </div>
    );
}
