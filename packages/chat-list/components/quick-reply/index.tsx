import { QuickReplyItem } from 'chat-list/types/message'
import React from 'react'
import Tolltip from 'chat-list/components/tooltip'
import { X } from 'lucide-react';
import useChatState from 'chat-list/hook/useChatState';
import { IAgentToolItem } from 'chat-list/types/plugin';
interface IQuickReplyProps {
    items: QuickReplyItem[];
    quickReply: (item: QuickReplyItem, index: number) => void;
}

export default function QuickReply(props: IQuickReplyProps) {
    const { items, quickReply } = props;
    const { agentTools, setAgentTools } = useChatState();
    const onClickItem = (item: QuickReplyItem, index: number) => {
        quickReply(item, index)
    }
    const onRemove = (item: IAgentToolItem, e: Event) => {
        e.stopPropagation();

        setAgentTools(agentTools.filter((tool) => tool.id !== item.id))
    }

    return (
        <div className='flex flex-row items-center text-sm w-full flex-wrap '>
            {
                items.map((item, i) => {
                    if (item.element) {
                        return item.element;
                    }
                    if (item.tip) {
                        return (
                            <Tolltip key={item.code} tip={item.tip} >
                                <div className='flex flex-row mb-1 mr-1 px-2 h-5 rounded-full border bg-popover cursor-pointer hover:bg-accent'
                                    key={item.code} onClick={onClickItem.bind(null, item, i)}>
                                    <span>
                                        {item.name}
                                    </span>
                                    {
                                        item.onRemove && (
                                            <div className='flex flex-row items-center' onClick={onRemove.bind(null, item)}>
                                                <X height={14} width={14} className=' text-gray-500' />
                                            </div>
                                        )
                                    }
                                </div>

                            </Tolltip>

                        )
                    } else {
                        return (
                            <div className='flex flex-row mb-1 mr-1 px-2 h-5 rounded-full border bg-popover cursor-pointer hover:bg-accent' key={item.code}
                                onClick={onClickItem.bind(null, item, i)}
                            >
                                <span>
                                    {item.name}
                                </span>
                                {
                                    item.onRemove && (
                                        <div className='flex flex-row items-center' onClick={onRemove.bind(null, item)}>
                                            <X height={14} width={14} className=' text-gray-500' />
                                        </div>
                                    )
                                }
                            </div>
                        )
                    }
                })
            }
        </div>
    )
}
