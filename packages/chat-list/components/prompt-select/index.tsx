import React, { useEffect, useState, useRef, useMemo } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "chat-list/components/ui/dropdown-menu";
import { Wand2 } from "lucide-react";
import { Input } from "../ui/input";
import prompt from 'chat-list/data/prompts';
import i18n from "chat-list/locales/i18n";

export interface IPrompts {
    act: string, prompt: string
}

interface ICommandsProps {
    onSelect: (item: IPrompts) => void;
    className?: string;
    style?: React.CSSProperties;
}

export const fetchMentions = (prompts: IPrompts[], mentionInput: string) => {
    return prompts.filter(item => item.act.toLowerCase().includes(mentionInput.toLowerCase()));
};

export const fetchPromptByInput = (prompts: IPrompts[], input: string) => {
    const mentionInput = input.slice(input.lastIndexOf('/') + 1);
    const newMentions = fetchMentions(prompts, mentionInput);
    return newMentions;
};

export const completeTextWithPrompt = (prompts: IPrompts[], input: string) => {
    if (!input.startsWith('/')) {
        return '';
    }
    const list = fetchPromptByInput(prompts, input);
    if (list.length == 0) {
        return '';
    }
    const mention = list[0];
    return mention.prompt;
};

export const completeTextWithSelectedPrompt = (mention: IPrompts) => {
    return mention.prompt;
};


export default React.memo(function Commands(props: ICommandsProps) {
    const { onSelect } = props;
    const [input, setInput] = useState('');
    const [list, setList] = useState<IPrompts[]>([]);
    const [mentionInput, setMentionInput] = useState('');
    const [waiting, setWaiting] = useState(true);
    const [open, setOpen] = useState(false);
    const inputField = useRef(null);
    const promptList = useMemo(() => {
        const prompts = prompt[i18n.resolvedLanguage] || prompt['en-US'];
        return prompts;

    }, [i18n.resolvedLanguage]);
    const onSelectCommand = (item: IPrompts) => {
        if (onSelect) {
            onSelect(item);
        }
        onToggle();
    };
    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);

    };

    const updateList = () => {
        if (!input) {
            setList(promptList);
            return;
        }

        const newMentions = fetchPromptByInput(promptList, input);
        setList(newMentions);
        setMentionInput(mentionInput);
    };

    const onToggle = () => {
        setOpen(!open);
    };

    useEffect(() => {
        updateList();
    }, [input]);

    const init = () => {
        setWaiting(true);
        setList(promptList);
        setWaiting(false);
    };
    useEffect(() => {
        init();
    }, []);

    return (
        <>
            {
                open && (
                    <div className=' bg-transparent fixed top-0 right-0 bottom-0 left-0 z-10 pointer-events-auto' onClick={onToggle} ></div>
                )
            }
            <DropdownMenu open={open} mask={true}  >
                <DropdownMenuTrigger asChild>
                    <Wand2 height={20} width={20} onClick={onToggle} />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="right-1 w-60 mr-1 p-2">
                    <Input ref={inputField} autoFocus className="w-full" value={input} onChange={onInputChange} ></Input>
                    <div className=" max-h-[400px] overflow-auto mt-1">
                        {list.map((item) => {
                            return (
                                <div
                                    className={` markdown cursor-pointer hover:bg-gray-100 ${list.length == 1 ? "bg-gray-200" : ""
                                        }`}
                                    key={item.act}
                                    onClick={onSelectCommand.bind(this, item)}
                                >
                                    <div className="flex flex-row items-start  ">
                                        <div>
                                            <div className="flex flex-row items-center">
                                                <span className="font-bold">{item.act}{ }</span>
                                            </div>
                                            <div className="mt-1 line-clamp-2">
                                                {item.prompt}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
});
