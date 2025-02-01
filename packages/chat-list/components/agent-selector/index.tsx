import React, { useEffect, useState } from 'react';
import useChatState from 'chat-list/hook/useChatState';
import {
    Bot,
    HelpCircle,
    X
} from "lucide-react";

import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "chat-list/components/ui/dropdown-menu";
import { useTranslation } from 'react-i18next';
import Tooltip from '../tooltip';
import Avatar from '../avatars';
import { IChatPlugin } from 'chat-list/types/plugin';
import { Switch } from 'chat-list/components/ui/switch';
// import { plugins } from 'chat-list/plugins/sheet';
interface IAgentSelectorProps {
    className?: string;
    onChange: (items: IChatPlugin[]) => void;
}

export default function ToolList(props: IAgentSelectorProps) {
    const { onChange } = props;
    const { t } = useTranslation(['base', 'tool']);
    const { plugin, plugins } = useChatState();
    const [allAgents, setAllAgents] = useState([]);
    const [colAgents, setColAgents] = useState([]);
    const [open, setOpen] = useState(false);

    const onToggle = () => {
        setOpen(!open);
    };

    const onAgentItemCheckChange = (item: IChatPlugin, checked: boolean) => {
        // if (plugin) {
        //     (plugin as any)['messages'] = messages;
        // }
        // const msgs = (item as any)['messages'];
        // if (msgs) {
        //     resetList(msgs);
        // } else {
        //     resetList([]);
        // }
        // resetList([]);
        // setPlugin(item)
        // if (item.mode) {
        //     setMode(item.mode)
        // }
        // setOpen(false)
        let agents: IChatPlugin[] = [];
        if (checked) {
            agents = (colAgents.concat(item));
        } else {
            agents = (colAgents.filter(i => i.action !== item.action));
        }
        setColAgents(agents);
        onChange?.(agents);
    };
    const onAgentCheckChange = (checked: boolean) => {
        if (checked) {
            setColAgents(allAgents);
        } else {
            setColAgents([]);
        }
    };
    const onRemove = (item: IChatPlugin, e: Event) => {
        e.stopPropagation();
        setColAgents(colAgents.filter(i => i.action !== item.action));
    };

    useEffect(() => {
        setAllAgents(plugins.filter(p => p.action != plugin.action));
    }, []);

    return (
        <>

            {
                open && (
                    <div className=' bg-transparent fixed top-0 right-0 bottom-0 left-0 z-10 pointer-events-auto' onClick={onToggle} ></div>
                )
            }
            <DropdownMenu open={open} mask={true} onOpenChange={() => onToggle} >
                <DropdownMenuTrigger asChild onClick={onToggle}>
                    <div className='flex flex-row'>
                        <div className='flex flex-row  items-center h-6 pl-1 pr-2 w-auto mx-1 mb-1 bg-white border justify-start sm:w-auto rounded-full cursor-pointer'>
                            <span className='flex flex-row justify-center items-center'>
                                <Avatar icon={Bot} height={16} width={16} />
                            </span>
                            <span className=' text-sm ml-1'>
                                {colAgents.length}
                            </span>
                            {/* <span>
                            <ChevronUp height={16} width={16} className={cn(
                                'text-gray-500 cursor-pointer transition-all pointer-events-auto',
                                open ? 'rotate-180' : ''
                            )} />
                        </span> */}
                        </div>
                        {
                            colAgents.length > 0 && colAgents.map((agent, i) => {
                                return (
                                    <div key={i} className='flex flex-row justify-center items-center h-6 pl-1 pr-2 w-auto mx-1 mb-1 bg-white border sm:w-auto rounded-full cursor-pointer'>
                                        <span className='flex flex-row justify-center items-center'>
                                            <Avatar icon={agent.icon} height={16} width={16} />
                                        </span>
                                        <span className=' text-sm ml-1'>
                                            {agent.name}
                                        </span>
                                        <span onClick={onRemove.bind(null, agent)}>
                                            <X height={16} width={16} className=' text-gray-500' />
                                        </span>
                                    </div>
                                );
                            })
                        }
                    </div>

                </DropdownMenuTrigger>

                <DropdownMenuContent className="ml-1 mr-1" side='top' align='start'>
                    <div className='flex flex-col sm:flow-row'>

                        {
                            allAgents.length > 0 && (
                                <div>
                                    <DropdownMenuLabel className="flex flex-row justify-between">
                                        <div className='flex flex-row items-center'>
                                            Select Agents
                                            <Tooltip className='' tip={'Select the agents to participate in your plan.'}>
                                                <HelpCircle className='text-gray-500 ml-1' height={16} width={16} />
                                            </Tooltip>
                                        </div>
                                        <Switch checked={allAgents.length == colAgents.length} onCheckedChange={onAgentCheckChange} />
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuGroup className='grid grid-cols-2 gap-1'>
                                        {
                                            allAgents.map((item) => {
                                                return (
                                                    <DropdownMenuCheckboxItem
                                                        className=' max-w-[140px] overflow-hidden sm:max-w-none'
                                                        checked={colAgents.some(p => p.action == item.action)}
                                                        key={item.id}
                                                        onCheckedChange={onAgentItemCheckChange.bind(null, item)}
                                                    >
                                                        <span className='mr-1'>
                                                            <Avatar icon={item.icon} />
                                                        </span>
                                                        <span>
                                                            {
                                                                item.action == 'sally' ? 'Sally' : (item.name || t(`base:agent.${item.action}`) as any)
                                                            }
                                                        </span>
                                                    </DropdownMenuCheckboxItem>
                                                );
                                            })
                                        }
                                    </DropdownMenuGroup>
                                </div>
                            )
                        }
                    </div>
                    {/* <DropdownMenuSeparator />
                    <DropdownMenuItem >
                        <Bot className="mr-2 h-4 w-4" />
                        <span className='cursor-pointer' onClick={onCreateAgent}>
                            {t('common.create_agent', 'Create Agent')}
                        </span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem >
                        <Code2 className="mr-2 h-4 w-4" />
                        <a className='cursor-pointer' target="_blank" href='https://forms.gle/jF9HRz2roWkX7EH56' onClick={onCreateAgent} rel="noreferrer">
                            {t('common.new_agent_request', 'Custome Agent Request')}
                        </a>
                    </DropdownMenuItem> */}
                </DropdownMenuContent>
            </DropdownMenu>
        </>

    );
}
