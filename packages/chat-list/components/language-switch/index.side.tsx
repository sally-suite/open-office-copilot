import React, { useEffect, useState } from 'react'
import { Globe } from 'lucide-react'

import sheetApi from '@api/sheet'
import docApi from '@api/doc'

import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "chat-list/components/ui/dropdown-menu"


import { useTranslation } from 'react-i18next';
import { languages } from 'chat-list/locales/i18n'
import useChatState from 'chat-list/hook/useChatState'
import useChromeStore from 'chat-list/hook/useChromeStore'
export default function index() {
    const { platform, docType, } = useChatState();
    const { t, i18n } = useTranslation();
    const { value, setValue, loading } = useChromeStore<string>('sally-extention-language', '');

    const onCheckChange = async (lng: string) => {
        await i18n.changeLanguage(lng);
        setValue(lng);
        if (platform === 'google') {
            if (docType === 'sheet') {
                // console.log('showSidePanel', docType)
                await sheetApi.showSidePanel('sheet-chat', 'sheet')
            } else if (docType === 'doc') {
                // console.log('showSidePanel', docType)
                await docApi.showSidePanel('doc-chat', 'doc')
            }
        } else {
            window.location.reload();
        }
    }
    useEffect(() => {
        if (!loading && value) {
            i18n.changeLanguage(value);
        }
    }, [value, loading])
    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Globe width={16} height={16} className="ml-2 cursor-pointer" />
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
