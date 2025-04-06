/* eslint-disable @typescript-eslint/ban-ts-comment */
import Icon from 'chat-list/components/icon';
import { IPagePlugin } from '../types';
// import CopyButton from './copy'
import React from 'react';
import { PanelRightClose } from 'lucide-react';

function openSidePanel(selectedText: string) {
    //@ts-ignore
    chrome?.storage?.local?.set({ selectedText });
    //@ts-ignore
    chrome?.runtime?.sendMessage({ action: "openSidePanel" });
}

const SidePanel: IPagePlugin = {
    id: 'side_panel',
    name: 'Side Panel',
    icon: ({ selectedText }: any) => {
        return (
            <div className='px-1' onClick={openSidePanel.bind(null, selectedText)}>
                <PanelRightClose
                    height={16} width={16}
                />
            </div>

        )
    }
}

export default SidePanel;