/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useEffect, useState } from 'react';

import { UserProvider } from 'chat-list/store/userContext';
import { ChatProvider } from 'chat-list/store/chatContext';
import { RouterProvider } from 'react-router-dom';
import Wellcome from 'chat-list/components/wellcome';
import { DocType, IChatPlugin } from 'chat-list/types/plugin';
import { getLocalStore, setLocalStore } from 'chat-list/local/local';
import { Toaster } from "chat-list/components/ui/toaster";
// import AgentStore from 'chat-list/pages/agent-store';
import { TooltipProvider } from 'chat-list/components/ui/tooltip';
import { AlertProvider } from 'chat-list/components/ui/use-alert';
import { useTranslation } from 'react-i18next';

interface IMainProps {
    docType: DocType;
    plugins: IChatPlugin[];
    router: any;
}

export default function Main({ router, docType, plugins }: IMainProps) {
    const [wellcome, setWellcome] = useState(getLocalStore('sheet-chat-wellcome'));
    const { t, i18n } = useTranslation('base', {
        lng: 'en-US',
    });

    useEffect(() => {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.remove();
        }
    }, []);
    return (
        <React.StrictMode>
            <TooltipProvider>
                <AlertProvider>
                    <UserProvider>
                        <ChatProvider key={i18n.resolvedLanguage} docType={docType} plugins={plugins}>
                            {
                                wellcome && (
                                    <RouterProvider router={router} />
                                )
                            }
                            {
                                !wellcome && (
                                    <Wellcome onStart={() => {
                                        setLocalStore('sheet-chat-wellcome', '1');
                                        setWellcome('1');
                                    }} />
                                )
                            }
                            <Toaster />
                        </ChatProvider>
                    </UserProvider>
                </AlertProvider>
            </TooltipProvider>
        </React.StrictMode>
    );
}
