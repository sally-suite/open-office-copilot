import React, { useState } from 'react'
import { Globe, Globe2 } from 'lucide-react'

import sheetApi from '@api/sheet'
import docApi from '@api/doc'
import slideApi from '@api/slide'

import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "chat-list/components/ui/dropdown-menu"


import { useTranslation } from 'react-i18next';
import { languages } from 'chat-list/locales/i18n'
import useChatState from 'chat-list/hook/useChatState'
export default function index() {
    const { platform, docType } = useChatState();

    const { t, i18n } = useTranslation();
    const onCheckChange = async (lng: string) => {
        i18n.changeLanguage(lng);
        if (platform === 'google') {
            if (docType === 'sheet') {
                // console.log('showSidePanel', docType)
                await sheetApi.showSidePanel('sheet-chat', 'sheet')
            } else if (docType === 'doc') {
                // console.log('showSidePanel', docType)
                await docApi.showSidePanel('doc-chat', 'doc')
            } else if (docType === 'slide') {
                // console.log('showSidePanel', docType)
                await slideApi.showSidePanel('slide-chat', 'doc')
            } else if (docType === 'chat') {
                // console.log('showSidePanel', docType)
                window.location.reload();
            }
        } else {
            window.location.reload();
        }
    }
    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Globe2 width={16} height={16} className="ml-2 cursor-pointer" />

                </DropdownMenuTrigger>
                <DropdownMenuContent >
                    {
                        Object.keys(languages).map((key) => {
                            return (
                                <DropdownMenuCheckboxItem
                                    checked={i18n.resolvedLanguage == key}
                                    key={key}
                                    onCheckedChange={onCheckChange.bind(null, key)}
                                >
                                    {
                                        (languages as any)[key].base.name || ''
                                    }
                                </DropdownMenuCheckboxItem>
                            )
                        })
                    }
                </DropdownMenuContent >
            </DropdownMenu>
        </>

    )
}
