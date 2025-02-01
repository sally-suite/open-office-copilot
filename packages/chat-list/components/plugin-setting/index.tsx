import React, { useContext } from 'react'
import { Checkbox } from 'chat-list/components/ui/checkbox';
import Tooltip from 'chat-list/components/tooltip'
import { ChatContext } from 'chat-list/store/chatContext'
import { buildChatMessage } from 'chat-list/utils';
import CardSheetInfo from '../card-sheet-info';

export default function PluginSetting() {
    const { appendMsg, setDataContext } = useContext(ChatContext)
    const onCheckedChange = () => {
        const msg = buildChatMessage(<CardSheetInfo onSubmit={(content: string) => {
            setDataContext(content);
            appendMsg(buildChatMessage(content, 'text', 'user'));
        }} />, 'card', 'user');
        appendMsg(msg);
    }

    return (
        <div className="flex items-center space-x-2 p-1 pt-0 mb-1 max-h-36 overflow-auto ">
            <Tooltip tip="Update sheet data context" className=' flex items-center cursor-pointer' >
                <div className=' text-xs mb-1 mr-1 px-2 h-5 rounded-full border bg-popover cursor-pointer hover:bg-accent'
                    onClick={onCheckedChange}
                >
                    Data context
                </div>
            </Tooltip>
        </div>
    )
}
