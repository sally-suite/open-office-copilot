import React, { useState } from 'react';

import { createRoot } from 'react-dom/client';
import { plugins } from 'chat-list/apps/chat/plugins';
import { init } from 'chat-list/service/log';
import { UserProvider } from 'chat-list/store/userContext';
import { ChatProvider } from 'chat-list/store/chatContext';
import { createHashRouter, createMemoryRouter, RouterProvider } from 'react-router-dom';
import 'chat-list/components/icon/svg-icons-register';
import 'chat-list/assets/css/global.css';
import 'chat-list/assets/css/common.less';
import 'chat-list/assets/css/chatui-theme.less';
import 'chat-list/assets/css/editor.less';
import 'chat-list/assets/css/markdown.less';

import { DocType, IChatPlugin } from 'chat-list/types/plugin';
import { getLocalStore } from 'chat-list/local/local';
import { Toaster } from "chat-list/components/ui/toaster";
import CreateAgent from 'chat-list/pages/create-agent';
import Chat from 'chat-list/pages/chat';
import { TooltipProvider } from 'chat-list/components/ui/tooltip';
import 'chat-list/locales/i18n';
import { useTranslation } from 'react-i18next';
import PythonEditor from 'chat-list/pages/python-editor';
import Jupyter from 'chat-list/pages/jupyter';
// import PPTRender from 'chat-list/pages/ppt-render';

const router = createHashRouter(
    [
        {
            path: '/',
            element: <Chat />
        },
        {
            path: '/create-agent',
            element: <CreateAgent />,
        },
        {
            path: '/setting/:id',
            element: <CreateAgent />,
        },
        {
            path: '/python-editor',
            element: <PythonEditor />,
        },
        {
            path: '/jupyter',
            element: <Jupyter />,
        },
        // {
        //     path: '/ppt-editor',
        //     element: <PPTRender />,
        // },
        // {
        //   path: '/agent-store',
        //   element: <AgentStore />,
        // }
        {
            path: '/:agent/*',
            element: <Chat />
        },
    ],
    {
        basename: '/',
    }
);

interface IMainProps {
    docType: DocType;
    plugins: IChatPlugin[];
}

export default function Main({ docType, plugins }: IMainProps) {
    const [wellcome, setWellcome] = useState(getLocalStore('sheet-chat-wellcome'));
    const { t, i18n } = useTranslation('base', {
        lng: 'en-US',
    });

    // useEffect(() => {
    //   const loading = document.getElementById('loading');
    //   if (loading) {
    //     loading.remove();
    //   }
    // }, []);
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
    root.render(<Main docType="chat" plugins={plugins} />);
};
