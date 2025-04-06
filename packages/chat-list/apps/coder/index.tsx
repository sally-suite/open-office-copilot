import React, { } from 'react';

import { createRoot } from 'react-dom/client';
import { plugins } from './plugins';
import { init } from 'chat-list/service/log';
import ChatList from 'chat-list/components/chat-list';
import { createMemoryRouter } from 'react-router-dom';
import 'chat-list/components/icon/svg-icons-register';
import 'chat-list/assets/css/global.css';
import 'chat-list/assets/css/common.less';
import 'chat-list/assets/css/chatui-theme.less';
import 'chat-list/assets/css/editor.less';
import 'chat-list/assets/css/markdown.less';

import CreateAgent from 'chat-list/pages/create-agent';
// import AgentStore from 'chat-list/pages/agent-store';
import 'chat-list/locales/i18n';
import JavascriptEditor from 'chat-list/pages/javascript-editor';
import Bookmarks from 'chat-list/components/bookmarks';
import PromptManage from 'chat-list/pages/prompt-manage';
import Main from 'chat-list/components/main';

const router = createMemoryRouter(
  [
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
      path: '/javascript-editor',
      element: <JavascriptEditor />,
    },
    {
      path: '/prompt-manage',
      element: <PromptManage />
    },
    {
      path: '/bookmarks/:agent',
      element: <Bookmarks />
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
  root.render(<Main router={router} docType="sheet" plugins={plugins} />);
};
