import React from 'react';

import { createRoot } from 'react-dom/client';
import { plugins } from 'chat-list/plugins/side';
import { init } from 'chat-list/service/log'
import { createMemoryRouter } from 'react-router-dom';
import 'chat-list/components/icon/svg-icons-register';
import 'chat-list/assets/css/global.css';
import 'chat-list/assets/css/common.less';
import 'chat-list/assets/css/chatui-theme.less';
import 'chat-list/assets/css/editor.less';
import 'chat-list/assets/css/markdown.less';

import CreateAgent from 'chat-list/pages/create-agent';
import Chat from 'chat-list/pages/side/index.sidepanel'
import 'chat-list/locales/i18n';
import Bookmarks from 'chat-list/components/bookmarks';
import PromptManage from 'chat-list/pages/prompt-manage';
import History from 'chat-list/components/chat-history';
import Main from 'chat-list/components/main';

const router = createMemoryRouter(
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
            path: '/prompt-manage',
            element: <PromptManage />
        },
        {
            path: '/bookmarks/:agent',
            element: <Bookmarks />
        },
        {
            path: '/history/:agent',
            element: <History />
        },
        {
            path: '/:agent/*',
            element: <Chat />
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



export const render = () => {

    init();
    let container: any = document.getElementById('__sally_chat__');
    if (!container) {
        container = document.createElement('div');
        container.id = '__sally_chat__';
        document.body.appendChild(container);
    }

    const root = createRoot(container); // createRoot(container!) if you use TypeScript
    root.render(<Main router={router} docType='side' plugins={plugins} />);
};

