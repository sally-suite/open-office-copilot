/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { } from 'react';

import { createRoot } from 'react-dom/client';
import { plugins } from 'chat-list/plugins/slide';
import { init } from 'chat-list/service/log';
import { createMemoryRouter } from 'react-router-dom';
import 'chat-list/components/icon/svg-icons-register';
import 'chat-list/assets/css/global.css';
import 'chat-list/assets/css/common.less';

// import AgentStore from 'chat-list/pages/agent-store';
import 'chat-list/locales/i18n';
import GenerateSlides from 'chat-list/pages/generate-slides';
import Main from 'chat-list/components/main';

const router = createMemoryRouter(
  [

    {
      path: '/',
      element: <GenerateSlides />,
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
