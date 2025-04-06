import React from 'react';
import Icon from 'chat-list/components/icon';
import useUserState from 'chat-list/hook/useUserState';
import useChatState from 'chat-list/hook/useChatState';
import { IChatPlugin } from 'chat-list/types/plugin';
import { useNavigate } from 'react-router-dom';
import Tooltip from '../tooltip';
import Avatar from '../avatars';
import { cn } from 'chat-list/lib/utils';
interface ILeftNavigationProps {
    onOpen: (open: boolean) => void;
}

const LeftNavigation = (props: ILeftNavigationProps) => {
    const { onOpen } = props;
    const { user, } = useUserState();
    const { plugin, setPlugin, resetList, messages, setMode, plugins } = useChatState();
    const navigate = useNavigate();
    const toggleNavigation = () => {
        onOpen?.(false);
    };
    const onAgentSelect = (plg: IChatPlugin) => {
        if (plugin) {
            (plugin as any)['messages'] = messages;
        }
        const msgs = (plg as any)['messages'];
        if (msgs) {
            resetList(msgs);
        } else {
            resetList([]);
        }
        setMode(plg.action, 'chat');
        // setPlugin(plg)
        navigate(`/${plg.action}`);
        onOpen?.(false);
    };

    const back = () => {
        window.location.href = "/";
    };
    const profile = () => {
        window.location.href = "/profile";
    };

    return (
        <div className="flex flex-col h-full overflow-y-auto w-auto">
            {/* <div className="flex justify-between items-center px-4 py-2 ">
                <div className=" flex flex-row items-center cursor-pointer" onClick={back}>
                    <Icon
                        name="logo"
                        style={{
                            height: 28,
                            width: 28,
                        }}
                    />
                    <span className='ml-2'>
                        Sally Chat
                    </span>
                </div>
                <div className="py-2 px-0 rounded focus:outline-none focus:shadow-outline sm:hidden" onClick={toggleNavigation}>
                    <X />
                </div>
            </div> */}
            <div className="px-4 flex-1 flex flex-col justify-center">
                <div className='flex flex-col p-0 w-16 pt-0 shadow-md items-center border rounded-md overflow-hidden '>
                    <div className={cn(
                        'flex flex-row items-center h-16 w-16 justify-center hover:bg-gray-100 cursor-pointer '
                    )}
                        onClick={back}

                    >
                        <Icon
                            name="logo"
                            style={{
                                height: 32,
                                width: 32,
                            }}
                        />
                    </div>
                    {plugins.map((item) => {
                        return (
                            <Tooltip key={item.conversationId} tip={item.name} side="right" align='center'>
                                <div key={item.conversationId} className={cn(
                                    'flex flex-row items-center h-16 w-16 justify-center hover:bg-gray-100 cursor-pointer ',
                                    plugin.action == item.action ? 'bg-gray-100 ' : ''
                                )}
                                    onClick={onAgentSelect.bind(null, item)}
                                >

                                    <Avatar icon={item.icon} height={28} width={28} className=' hover:scale-125 transition-all duration-300 ease-in-out' />


                                </div>
                            </Tooltip>
                        );
                    })}
                    {/* <div className={cn(
                        'flex flex-row items-center h-16 w-16 justify-center hover:bg-gray-100 cursor-pointer '
                    )}
                        onClick={profile}
                    >

                        {
                            user.image && (
                                <img className="h-8 w-8 rounded-full" src={user.image} alt="User Avatar" />
                            )
                        }{
                            !user.image && (
                                <div className="h-10 w-10 rounded-full flex shrink-0 justify-center items-center border bg-gray-200 text-xl "  >
                                    {user?.email?.charAt(0).toUpperCase()}
                                </div>
                            )
                        }
                    </div> */}
                </div>

            </div>
        </div>
    );
};

export default LeftNavigation;
