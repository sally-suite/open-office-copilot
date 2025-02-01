import React, { useEffect, useState } from 'react';
import useChatState from 'chat-list/hook/useChatState'
import {
    Bot,
    LogOut,
    Wand2,
    Wrench,
    Code2
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
import { snakeToWords } from 'chat-list/utils';
import { useTranslation } from 'react-i18next'
import PromptSelect from 'chat-list/components/composer/Composer/Prompts';
import prompts from 'chat-list/data/prompts/en-US.json'
interface IToolListProps {
    className?: string;
}

export default function ToolList(props: IToolListProps) {
    const { className } = props;
    const { t } = useTranslation(['base', 'tool']);
    const { agentTools, docType, colAgents, setAgentTools, setAgentTool, setColAgent, setColAgents } = useChatState();

    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    const onToggle = () => {
        setOpen(!open);
    }
    const onToolCheckChange = (checked: boolean) => {
        setAgentTools(agentTools.map(item => {
            return {
                ...item,
                enable: checked
            }
        }));
    }
    const onToolItemCheckChange = (id: string, checked: boolean) => {
        setAgentTool(id, checked);
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
    console.log(prompts)
    return (
        <>

            {
                open && (
                    <div className=' bg-transparent fixed top-0 right-0 bottom-0 left-0 z-10 pointer-events-auto' onClick={onToggle} ></div>
                )
            }
            <DropdownMenu open={open} mask={true} onOpenChange={() => onToggle} >
                <DropdownMenuTrigger asChild onClick={onToggle}>
                    <Wand2 height={20} width={20} className={cn(
                        'text-gray-500 absolute top-1 right-1 z-20 cursor-pointer transition-all pointer-events-auto',
                        open ? 'rotate-45' : ''
                    )}
                        onClick={onToggle}
                    />
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-56  right-1 mr-1">
                    <div>
                        aa
                    </div>
                    <PromptSelect prompts={prompts} input='' onSelect={() => {
                        console.log('first')
                    }} />
                </DropdownMenuContent>
            </DropdownMenu>
        </>

    )
}
