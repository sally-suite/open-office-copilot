import React, { useEffect, useState } from 'react';

import { createRoot } from 'react-dom/client';
import { plugins } from 'chat-list/apps/chat/plugins';
import { init } from 'chat-list/service/log'
import { UserProvider } from 'chat-list/store/userContext';
import { ChatProvider } from 'chat-list/store/chatContext';
import 'chat-list/components/icon/svg-icons-register';
import 'chat-list/assets/css/global.css';
import 'chat-list/assets/css/common.less';
import 'chat-list/assets/css/chatui-theme.less';
import 'chat-list/assets/css/editor.less';
import 'chat-list/assets/css/markdown.less';

import { DocType, IChatPlugin } from 'chat-list/types/plugin';
import { getLocalStore } from 'chat-list/local/local';
import { Toaster } from "chat-list/components/ui/toaster";
import Jupyter from 'chat-list/pages/jupyter'
import { TooltipProvider } from 'chat-list/components/ui/tooltip';
import 'chat-list/locales/i18n';
import { useTranslation } from 'react-i18next';
import { createHashRouter, RouterProvider, createMemoryRouter } from 'react-router-dom';


interface IMainProps {
    docType: DocType;
    plugins: IChatPlugin[];
}

const router = createMemoryRouter(
    [
        {
            path: '/',
            element: <Jupyter />,
        },
        // {
        //   path: '/agent-store',
        //   element: <AgentStore />,
        // }
    ],
    {
        basename: '/',
    }
);

export default function Main({ docType, plugins }: IMainProps) {
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
                <UserProvider>
                    <ChatProvider key={i18n.resolvedLanguage} docType={docType} plugins={plugins}>
                        <RouterProvider router={router} />

                        <Toaster />
                    </ChatProvider>
                </UserProvider>
            </TooltipProvider>
        </React.StrictMode>
    );
}

export const render = () => {
    init();
    const container: any = document.getElementById('root');
    const root = createRoot(container); // createRoot(container!) if you use TypeScript
    root.render(<Main docType='sheet' plugins={plugins} />);
};
