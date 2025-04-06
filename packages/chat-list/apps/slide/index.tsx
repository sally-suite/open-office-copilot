/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { } from 'react';

import { createRoot } from 'react-dom/client';
import { plugins } from 'chat-list/plugins/slide';
import { init } from 'chat-list/service/log';
import ChatList from 'chat-list/pages/chat-panel';
import { createMemoryRouter } from 'react-router-dom';
import 'chat-list/components/icon/svg-icons-register';
import 'chat-list/assets/css/global.css';
import 'chat-list/assets/css/common.less';
import 'chat-list/assets/css/chatui-theme.less';
import 'chat-list/assets/css/editor.less';
import 'chat-list/assets/css/markdown.less';

import CreateAgent from 'chat-list/pages/create-agent';
// import AgentStore from 'chat-list/pages/agent-store';
import Chat from 'chat-list/pages/chat';
import 'chat-list/locales/i18n';
import PythonEditor from 'chat-list/pages/python-editor';
import Bookmarks from 'chat-list/components/bookmarks';
import PPTRender from 'chat-list/pages/ppt-render';
import GenerateSlides from 'chat-list/pages/generate-slides';
import PromptManage from 'chat-list/pages/prompt-manage';
import History from 'chat-list/components/chat-history';
import Main from 'chat-list/components/main';


const router = createMemoryRouter(
  [
    {
      path: '/chat',
      element: <Chat />
    },
    {
      path: '/',
      element: <ChatList />,
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
      path: '/ppt-editor',
      element: <PPTRender />,
    },
    {
      path: '/generate-slides',
      element: <GenerateSlides />,
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
      path: '/prompt-manage',
      element: <PromptManage />
    },
    {
      path: '/:agent/*',
      element: <ChatList />
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
  root.render(<Main router={router} docType="slide" plugins={plugins} />);
};
