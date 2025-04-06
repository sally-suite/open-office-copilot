import Button from "chat-list/components/button";
import { Plus } from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
// import promptList from 'chat-list/data/prompts/prompt.json'
// import Icon from 'chat-list/components/icon'
// import { LucideIcon } from "lucide-react";

export interface IPrompts {
    name: string, prompt: string
}

interface ICommandsProps {
    prompts: IPrompts[];
    input: string;
    onSelect: (item: IPrompts) => void;
    className?: string;
    style?: React.CSSProperties;
}

export const fetchMentions = (prompts: IPrompts[], mentionInput: string) => {
    return prompts.filter(item => item.name.toLowerCase().includes(mentionInput.toLowerCase()));
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

export const completeTextWithSelectedPrompt = (mention: IPrompts, input: string) => {
    return mention.prompt;
};


export default React.memo(function Commands(props: ICommandsProps) {
    const { input, onSelect, className = "", prompts = [], style = {} } = props;
    const { t } = useTranslation(['base', 'tool']);

    const [bottom, setBottom] = useState(0);
    const [list, setList] = useState<IPrompts[]>([]);
    const [mentionInput, setMentionInput] = useState('');
    const [showMentionList, setShowMentionList] = useState(false);
    const [waiting, setWaiting] = useState(true);
    const navigate = useNavigate();

    const store = useRef(null);
    const onSelectCommand = (item: IPrompts) => {
        if (onSelect) {
            onSelect(item);
        }
    };
    const onInputChange = () => {
        if (!input || !input.startsWith('/')) {
            setShowMentionList(false);
            return;
        }
        if (input.endsWith('/')) {
            setShowMentionList(true);
            console.log(prompts)
            setList(prompts);
            return;
        }
        const newMentions = fetchPromptByInput(prompts, input);
        setList(newMentions);
        setMentionInput(mentionInput);
    };

    // const handleMentionSelect = (mention: any) => {
    //     const preMentionText = input.slice(0, input.lastIndexOf('@') + 1);
    //     const newText = preMentionText + mention.name + ' ' + input.slice(cursorPosition);

    //     setMentionInput('');
    //     setShowMentionList(false);
    // }
    // const handleKeyPress = useCallback((e: KeyboardEvent) => {
    //     if (e.key === 'Enter') {
    //         if (showMentionList && list.length > 0) {
    //             
    //             e.preventDefault();
    //             e.stopPropagation();
    //             handleMentionSelect(list[0]);

    //         } else {
    //             // Handle Enter key press, e.g., submit the form or perform some other action.
    //             console.log('Enter key pressed');
    //         }
    //     }
    // }, [showMentionList, list]);
    const onAdd = async () => {
        navigate('/prompt-manage');
    }


    useEffect(() => {
        onInputChange();
    }, [input]);

    const init = () => {
        setWaiting(true);
        setList(prompts);
        setWaiting(false);
    };
    useEffect(() => {
        init();
    }, []);


    if (!showMentionList) {
        return null;
    }

    return (
        <div
            className={` relative markdown ml-0 mr-0  ${className}`}
            style={{
                width: "auto",
                // margin: "0 12px 0 12px",
                bottom,
                zIndex: 200,
                ...style,
            }}
        >
            <div className=" absolute left-0 shadow-md border bg-popover rounded-md bottom-2 transition-all right-0 max-h-[400px] overflow-auto">
                {list.map((item) => {
                    return (
                        <div
                            className={` markdown cursor-pointer hover:bg-gray-100 p-1 ${list.length == 1 ? "bg-gray-200" : ""
                                }`}
                            key={item.name}
                            onClick={onSelectCommand.bind(this, item)}
                        >
                            <div className="flex flex-row items-start  ">
                                <div>
                                    <div className="flex flex-row items-center">
                                        <span className="ml-1 font-bold">{item.name}{ }</span>
                                    </div>
                                    <div className="pl-1 mt-1 line-clamp-3">
                                        {item.prompt}
                                    </div>
                                </div>
                            </div>

                        </div>
                    );
                })}
                <div className='w-full flex justify-center p-2'>
                    <Button icon={Plus} onClick={onAdd} variant="ghost" >
                        {t('common.add_prompt')}
                    </Button>
                </div>
            </div>
        </div>
    );
});
