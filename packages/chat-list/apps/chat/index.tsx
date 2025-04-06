import React from 'react';

import { createRoot } from 'react-dom/client';
import { plugins } from 'chat-list/apps/chat/plugins';
import { init } from 'chat-list/service/log';
import { createHashRouter } from 'react-router-dom';
import 'chat-list/components/icon/svg-icons-register';
import 'chat-list/assets/css/global.css';
import 'chat-list/assets/css/common.less';
import 'chat-list/assets/css/chatui-theme.less';
import 'chat-list/assets/css/editor.less';
import 'chat-list/assets/css/markdown.less';

import CreateAgent from 'chat-list/pages/create-agent';
import Chat from 'chat-list/pages/chat';

import 'chat-list/locales/i18n';
import PythonEditor from 'chat-list/pages/python-editor';
import Jupyter from 'chat-list/pages/jupyter';
import PromptManage from 'chat-list/pages/prompt-manage';
// import PPTRender from 'chat-list/pages/ppt-render';
import History from 'chat-list/components/chat-history';
import Main from 'chat-list/components/main';

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
        {
            path: '/history/:agent',
            element: <History />
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
            path: '/prompt-manage',
            element: <PromptManage />
        },
        {
            path: '/:agent/*',
            element: <Chat />
        },
    ],
    {
        basename: '/',
    }
);


export const render = () => {
    init();
    const container: any = document.getElementById('root');
    const root = createRoot(container); // createRoot(container!) if you use TypeScript
    root.render(<Main router={router} docType="chat" plugins={plugins} />);
};
