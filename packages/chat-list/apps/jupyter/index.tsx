import React, { } from 'react';

import { createRoot } from 'react-dom/client';
import { plugins } from 'chat-list/apps/chat/plugins';
import { init } from 'chat-list/service/log';
import 'chat-list/components/icon/svg-icons-register';
import 'chat-list/assets/css/global.css';
import 'chat-list/assets/css/common.less';
import 'chat-list/assets/css/chatui-theme.less';
import 'chat-list/assets/css/editor.less';
import 'chat-list/assets/css/markdown.less';

import Jupyter from 'chat-list/pages/jupyter';
import 'chat-list/locales/i18n';
import { createMemoryRouter } from 'react-router-dom';
import Main from 'chat-list/components/main';


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


export const render = () => {
    init();
    const container: any = document.getElementById('root');
    const root = createRoot(container); // createRoot(container!) if you use TypeScript
    root.render(<Main router={router} docType='sheet' plugins={plugins} />);
};
