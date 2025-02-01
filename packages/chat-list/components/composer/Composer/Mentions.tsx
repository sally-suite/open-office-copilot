import React, { useCallback, useContext, useEffect, useState } from "react";
import { LucideIcon } from "lucide-react";
import { capitalizeFirstLetter } from "chat-list/utils";
// import Icon from 'chat-list/components/icon'
// import { LucideIcon } from "lucide-react";
import Avatar from 'chat-list/components/avatars';
export interface IMention {
    name: string, avatar?: string, description?: string
}

interface ICommandsProps {
    mentions: IMention[];
    input: string;
    onSelect: (item: IMention) => void;
    className?: string;
    style?: React.CSSProperties;
    cursorPosition: number;
}

export const fetchMentions = (mentions: IMention[], mentionInput: string) => {
    return mentions.filter(item => item.name.toLowerCase().startsWith(mentionInput.toLowerCase()));
};

export const fetchMetionByInput = (mentions: IMention[], input: string, cursorPosition: number) => {
    const mentionInput = input.slice(input.lastIndexOf('@') + 1, cursorPosition);
    const newMentions = fetchMentions(mentions, mentionInput);
    return newMentions;
};

export const completeTextWithMetion = (mentions: IMention[], input: string, cursorPosition: number) => {
    if (!input || input.endsWith(' ')) {
        return '';
    }
    const list = fetchMetionByInput(mentions, input, cursorPosition);
    if (list.length == 0) {
        return '';
    }
    const mention = list[0];
    const preMentionText = input.slice(0, input.lastIndexOf('@') + 1);
    const newText = preMentionText + capitalizeFirstLetter(mention.name) + ' ' + input.slice(cursorPosition);
    return newText;
};

export const completeTextWithSelectedMetion = (mention: IMention, input: string, cursorPosition: number) => {
    const preMentionText = input.slice(0, input.lastIndexOf('@') + 1);
    const newText = preMentionText + capitalizeFirstLetter(mention.name) + ' ' + input.slice(cursorPosition);
    return newText;
};

export default React.memo(function Commands(props: ICommandsProps) {
    const { input, onSelect, className = "", mentions = [], style = {}, cursorPosition } = props;
    const [bottom, setBottom] = useState(0);
    const [list, setList] = useState([]);
    const [mentionInput, setMentionInput] = useState('');
    const [showMentionList, setShowMentionList] = useState(false);

    const onSelectCommand = (item: IMention) => {
        if (onSelect) {
            onSelect(item);
        }
    };
    const onInputChange = () => {
        if (!input) {
            setShowMentionList(false);
            return;
        }
        if (input.endsWith('@')) {
            setShowMentionList(true);
            setList(mentions);
            return;
        }
        if (input.endsWith(' ')) {
            setMentionInput('');
            setShowMentionList(false);
            setList([]);
            return;
        }
        const newMentions = fetchMetionByInput(mentions, input, cursorPosition);
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



    useEffect(() => {
        onInputChange();
    }, [input]);


    if (!showMentionList) {
        return null;
    }
    if (list.length == 0) {
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
            <div className=" absolute left-0 shadow-md border bg-popover rounded-md bottom-4 transition-all right-0 max-h-96 overflow-auto">
                {list.map((item) => {

                    return (
                        <div
                            className={` markdown cursor-pointer hover:bg-gray-100 p-1 ${list.length == 1 ? "bg-gray-200" : ""
                                }`}
                            key={item.name}
                            onClick={onSelectCommand.bind(this, item)}
                        >
                            <div className="flex flex-col items-start  ">

                                <Avatar icon={item.avatar} height={16} width={16} className="text-sm" name={capitalizeFirstLetter(item.name)} />
                                <div className="pl-5 mt-1" dangerouslySetInnerHTML={{
                                    __html: item.description
                                }}>

                                </div>

                            </div>

                        </div>
                    );
                })}
            </div>
        </div>
    );
});

