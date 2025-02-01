import React from 'react';
import Icon from 'chat-list/components/icon';
import useUserState from 'chat-list/hook/useUserState';
import { Plus } from 'lucide-react';
import useChatState from 'chat-list/hook/useChatState';
import { IChatPlugin } from 'chat-list/types/plugin';
import Avatar from '../avatars';
import { cn } from 'chat-list/lib/utils';
import { useNavigate } from 'react-router-dom';
import Tooltip from 'chat-list/components/tooltip';

const LeftNavigation = () => {
    const { user } = useUserState();
    const { plugins, plugin, setPlugin, resetList, messages, setMode, } = useChatState();
    const navigate = useNavigate();

    const onSelect = (plg: IChatPlugin) => {
        // console.log(plugin)
        if (plugin) {
            (plugin as any)['messages'] = messages;
        }
        const msgs = (plg as any)['messages'];
        if (msgs) {
            resetList(msgs);
        } else {
            resetList([]);
        }
        setMode(plg.action, plg.mode || 'chat');
        navigate(`/${plg.action}`);
        setPlugin(plg);
    };

    const onCreate = () => {
        navigate('/create-agent');
    };

    return (
        <div className="flex flex-col h-full overflow-y-auto w-10 ">
            <div className="flex flex-row justify-center items-center w-full h-10 ">
                <a href="https://www.sally.bot/" target='_blank' rel="noreferrer">
                    <Icon
                        name="logo"
                        style={{
                            height: 20,
                            width: 20,
                        }}
                    />
                </a>

                {/* <div className=" flex flex-row items-center justify-center cursor-pointer h-14" onClick={back}>
                    <Icon
                        name="logo"
                        style={{
                            height: 32,
                            width: 32,
                        }}
                    />
                </div> */}
                {/* <div className=" absolute top-0 right-0 p-1 cursor-pointer text-gray-500 rounded focus:outline-none focus:shadow-outline " onClick={toggleNavigation}>
                    <XCircle height={14} width={14} />
                </div> */}
            </div>
            <div className="p-0 flex-1">
                {plugins.map((item) => {
                    return (
                        <div key={item.conversationId} className={cn(
                            'flex flex-row items-center justify-center hover:bg-gray-100 cursor-pointer w-full h-10',
                            plugin.action == item.action ? 'bg-gray-100 ' : ''
                        )}
                            onClick={onSelect.bind(null, item)}
                        >
                            <Tooltip tip={item.name} align='center' side='left'>
                                <Avatar icon={item.icon} height={24} width={24} />

                            </Tooltip>
                        </div>
                    );
                })}

                <div className={cn(
                    'flex flex-row items-center justify-center hover:bg-gray-100 cursor-pointer w-full h-10'
                )}
                    onClick={onCreate}
                >
                    <Avatar icon={Plus} height={20} width={20} />
                </div>
            </div>
            <div className="flex items-center justify-center py-1 border-t whitespace-nowrap overflow-hidden text-ellipsis cursor-pointer " >
                {/* <img className="h-8 w-8 rounded-full" src={user.image} alt="User Avatar" /> */}
                <div className="h-6 w-6 rounded-full flex shrink-0 justify-center items-center border bg-gray-200 text-sm "  >
                    <a target='_blank' href="https://www.sally.bot/profile" rel="noreferrer">
                        {user?.email?.charAt(0).toUpperCase() || ''}
                    </a>
                </div>
                {/* <div className="ml-2 whitespace-nowrap overflow-hidden text-ellipsis text-gray-500">
                    {user.email}
                </div> */}
            </div>
        </div>
    );
};

export default LeftNavigation;
