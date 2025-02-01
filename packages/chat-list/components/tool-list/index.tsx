import React, { MouseEventHandler, useEffect, useState } from 'react';
import useChatState from 'chat-list/hook/useChatState'
import {
    Code2,
    HelpCircle,
    Settings,
    X
} from "lucide-react"
import { useNavigate } from "react-router-dom";

import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "chat-list/components/ui/dropdown-menu";
import { Switch } from 'chat-list/components/ui/switch'
import { cn } from 'chat-list/lib/utils';
import { useTranslation } from 'react-i18next'
import Tooltip from '../tooltip';
import { SHEET_CHAT_SITE } from 'chat-list/config/site';
interface IToolListProps {
    className?: string;
}

export default function ToolList(props: IToolListProps) {
    const { className } = props;
    const { t } = useTranslation(['base', 'tool']);
    const { agentTools, plugin, model, docType, colAgents, setAgentTools, setAgentTool, setColAgent, setColAgents } = useChatState();

    const [open, setOpen] = useState(false);
    const [canUseTool, setCanUseTool] = useState(true)
    const navigate = useNavigate();

    const onToggle = () => {
        setOpen(!open);
    }
    const onToolCheckChange = (checked: boolean) => {
        if (checked) {
            setAgentTools(plugin.tools.map(id => {
                return {
                    id,
                    name: id,
                    enable: true
                }
            }));
        } else {
            setAgentTools([])
        }

    }
    const onToolItemCheckChange = (id: string, checked: boolean) => {
        // setAgentTool(id, checked);
        if (checked) {
            // setAgentTools([{ id, name: id, enable: true }])
            setAgentTools(agentTools.concat({ id, name: id, enable: true }));
        } else {
            setAgentTools(agentTools.filter(item => item.id !== id))
        }
        // setOpen(false)
    }
    const onAgentCheckChange = (checked: boolean) => {
        setColAgents(colAgents.map(item => {
            return {
                ...item,
                enable: checked
            }
        }));

    }
    const onAgentItemCheckChange = (id: string, checked: boolean) => {
        setColAgent(id, checked)
    }
    const onCreateAgent = () => {
        navigate("/create-agent");
    }
    const showTools = () => {
        window.open(`${SHEET_CHAT_SITE}/guide/tools`, '_blank')
    }
    const showAgents = () => {
        window.open(`${SHEET_CHAT_SITE}/guide/agents`, '_blank')
    }
    const onClear: MouseEventHandler<HTMLSpanElement> = (e) => {
        e.stopPropagation();
        setAgentTools([])
    }
    const gotoSetting = () => {
        navigate(`/setting/${plugin.id}`)
    }
    // if (!plugin.tools || plugin.tools.length == 0) {
    //     return null;
    // }
    useEffect(() => {
        if (model === 'ERNIE-Speed-128K') {
            setCanUseTool(false)
            if (agentTools.length > 0) {
                setAgentTools([])
            }
        } else {
            setCanUseTool(true)
        }
    }, [model, agentTools])

    if (plugin?.tools?.length == 0) {
        return null;
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
                    <div className='h-6 text-sm flex flex-row items-center rounded-full border px-1 bg-white'>
                        <Settings height={16} width={16} className={cn(
                            'text-gray-500 cursor-pointer transition-all pointer-events-auto',
                            open ? 'rotate-45' : ''
                        )}
                            onClick={onToggle}
                        />
                        {
                            (agentTools && agentTools.length > 0) && (
                                <div className='flex flex-row items-center text-gray-500 text-sm  whitespace-nowrap  px-1 cursor-pointer'>
                                    {
                                        agentTools.length <= 1 && agentTools?.map((item, index) => {
                                            return t(`tool:${item.id}`);
                                        }).join(' | ')
                                    }
                                    {
                                        agentTools.length > 1 && `${agentTools.length}`
                                    }
                                    <span onClick={onClear}>
                                        <X height={14} width={14} className='ml-1' />
                                    </span>
                                </div>
                            )
                        }
                        {
                            agentTools?.length == 0 && (
                                <div className='flex flex-row items-center text-gray-500 text-sm  whitespace-nowrap  px-1 cursor-pointer'>
                                    {t('common.chat_only')}
                                </div>
                            )
                        }

                    </div>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="ml-1 mr-1" side='top' align='start'>
                    {/* <div className='flex flex-col sm:flow-row'> */}
                    {
                        !canUseTool && (
                            <p className='w-64 p-1 text-sm'>
                                {t(`common.not_support_tools`)}
                            </p>
                        )
                    }
                    {
                        canUseTool && plugin.tools && plugin.tools.length > 0 && (
                            <div>
                                <DropdownMenuLabel className="flex flex-row justify-between">
                                    <div className='flex flex-row items-center'>
                                        {t('common.tools', 'Tools')}
                                        <Tooltip className='' tip={t('common.tools_tip', 'The tools Sally can use, you can enable or disable them.')}>
                                            <HelpCircle className='text-gray-500 ml-1' onClick={showTools} height={16} width={16} />
                                        </Tooltip>
                                    </div>
                                    <Switch checked={plugin.tools.length == agentTools.length} onCheckedChange={onToolCheckChange} />

                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup className='grid grid-cols-2 gap-1'>

                                    {
                                        plugin.tools?.map((id, index) => {
                                            return (
                                                <DropdownMenuCheckboxItem
                                                    className=' max-w-[140px] overflow-hidden sm:max-w-none'
                                                    key={id}
                                                    checked={!!agentTools.find(p => p.id == id)}
                                                    onCheckedChange={onToolItemCheckChange.bind(null, id)}
                                                >
                                                    {t(`tool:${id}`)}
                                                </DropdownMenuCheckboxItem>
                                            )
                                        })
                                    }
                                </DropdownMenuGroup>
                            </div>
                        )
                    }

                    {/* {
                            colAgents && colAgents.length > 0 && (
                                <div>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuLabel className="flex flex-row justify-between">
                                        <div className='flex flex-row items-center'>
                                            {t('common.agents', 'Agents')}
                                            <Tooltip className='' tip={t('common.agents_tip', 'The agents you can use,you can enable or disable them.')}>
                                                <HelpCircle className='text-gray-500 ml-1' onClick={showAgents} height={16} width={16} />
                                            </Tooltip>
                                        </div>
                                        <Switch checked={colAgents && colAgents.some(p => p.enable)} onCheckedChange={onAgentCheckChange} />
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuGroup className='grid grid-cols-2 gap-1'>
                                        {
                                            colAgents.map((item, index) => {
                                                // const PluginIcon = item.icon;
                                                return (
                                                    <DropdownMenuCheckboxItem
                                                        className=' max-w-[140px] overflow-hidden sm:max-w-none'
                                                        checked={item.enable}
                                                        key={item.id}
                                                        onCheckedChange={onAgentItemCheckChange.bind(null, item.id)}
                                                    >
                                                        <span>
                                                            {
                                                                t(`base:${docType}.agent.${item.id}` as any)
                                                            }
                                                        </span>
                                                    </DropdownMenuCheckboxItem>
                                                )
                                            })
                                        }
                                    </DropdownMenuGroup>
                                </div>
                            )
                        } */}
                    {/* </div> */}

                    {/* <DropdownMenuItem >
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
                    {
                        plugin.id && (
                            <>
                                {
                                    agentTools && agentTools.length > 0 && (
                                        <DropdownMenuSeparator />
                                    )
                                }

                                <DropdownMenuItem >
                                    <Code2 className="mr-2 h-4 w-4" />
                                    <span className='cursor-pointer' onClick={gotoSetting}>
                                        {t('common.setting', 'Setting')}
                                    </span>
                                </DropdownMenuItem>
                            </>
                        )
                    }
                </DropdownMenuContent>
            </DropdownMenu>
        </>

    )
}
