import React, { useState } from 'react';
import useChatState from 'chat-list/hook/useChatState'
import {
    Bot,
    Code2,
    HelpCircle,
    ChevronUp
} from "lucide-react"
import { useNavigate } from "react-router-dom";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "chat-list/components/ui/dropdown-menu";
import { cn } from 'chat-list/lib/utils';
import { useTranslation } from 'react-i18next'
import Tooltip from '../tooltip';
import { SHEET_CHAT_SITE } from 'chat-list/config/site';
import Avatar from '../avatars';
import { IChatPlugin } from 'chat-list/types/plugin';

interface IToolListProps {
    onAgentSelect?: (agent: IChatPlugin) => void;
    className?: string;
}

export default function AgentPanel(props: IToolListProps) {
    const { onAgentSelect } = props;
    const { t } = useTranslation(['base', 'tool']);
    const { plugin, setPlugin, messages, plugins, resetList, setMode } = useChatState();

    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    const onToggle = () => {
        setOpen(!open);
    }

    const onCreateAgent = () => {
        navigate("/create-agent");
    }

    const onSelectAgent = (plg: IChatPlugin) => {
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
        navigate(`/${plg.action}`)
        setPlugin(plg);
        if (onAgentSelect) {
            onAgentSelect(plg);
        }
        onToggle();
    }
    const showAgents = () => {
        window.open(`${SHEET_CHAT_SITE}/guide/agents`, '_blank')
    }
    return (
        <>

            {
                open && (
                    <div className=' bg-transparent fixed top-0 right-0 bottom-0 left-0 z-10 pointer-events-auto' onClick={onToggle} ></div>
                )
            }
            <DropdownMenu open={open} mask={true} onOpenChange={() => onToggle} >
                <DropdownMenuTrigger asChild onClick={onToggle}>
                    <div className='flex flex-row  items-center h-6 pl-1 pr-2 w-auto mx-1 bg-white border justify-start sm:w-auto rounded-full cursor-pointer'>
                        <span className='flex flex-row justify-center items-center'>
                            <Avatar icon={plugin.icon} height={16} width={16} />
                        </span>

                        <span className=' text-sm ml-1'>
                            {plugin.name}
                        </span>
                        <span>
                            <ChevronUp height={16} width={16} className={cn(
                                'text-gray-500 cursor-pointer transition-all pointer-events-auto',
                                open ? 'rotate-180' : ''
                            )} />
                        </span>
                    </div>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="ml-1 mr-1" side='top' align='start'>
                    <div className='flex flex-col sm:flow-row'>

                        {
                            plugins && plugins.length > 0 && (
                                <div>
                                    <DropdownMenuLabel className="flex flex-row justify-between">
                                        <div className='flex flex-row items-center'>
                                            {t('common.agents', 'Agents')}
                                            <Tooltip className='' tip={t('common.agents_tip', 'The agents you can use,you can enable or disable them.')}>
                                                <HelpCircle className='text-gray-500 ml-1' onClick={showAgents} height={16} width={16} />
                                            </Tooltip>
                                        </div>
                                        {/* <Switch checked={colAgents && colAgents.some(p => p.enable)} onCheckedChange={onAgentCheckChange} /> */}
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuGroup className='grid grid-cols-2 gap-1'>
                                        {
                                            plugins.filter(p => p.action != plugin.action).map((item) => {
                                                return (
                                                    <DropdownMenuItem
                                                        className=' flex flex-row items-center max-w-[140px] overflow-hidden sm:max-w-none'
                                                        key={item.id}
                                                        onClick={onSelectAgent.bind(null, item)}
                                                    >
                                                        <span className='mr-1'>
                                                            <Avatar icon={item.icon} />
                                                        </span>
                                                        <span>
                                                            {
                                                                item.action == 'sally' ? 'Sally' : (item.name || t(`base:agent.${item.action}`) as any)
                                                            }
                                                        </span>
                                                    </DropdownMenuItem>
                                                )
                                            })
                                        }
                                    </DropdownMenuGroup>
                                </div>
                            )
                        }
                    </div>
                    <DropdownMenuSeparator />
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
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>

    )
}
