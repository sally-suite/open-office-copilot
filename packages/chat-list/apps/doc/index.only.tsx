/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useEffect, useState } from 'react';

import { createRoot } from 'react-dom/client';
import { plugins } from 'chat-list/plugins/doc';
import { init } from 'chat-list/service/log';
import ChatList from 'chat-list/components/chat-list';
import { UserProvider } from 'chat-list/store/userContext';
import { ChatProvider } from 'chat-list/store/chatContext';
import { createHashRouter, RouterProvider, createMemoryRouter } from 'react-router-dom';
import 'chat-list/components/icon/svg-icons-register';
import Wellcome from 'chat-list/components/wellcome';
import 'chat-list/assets/css/global.css';
import 'chat-list/assets/css/common.less';
import 'chat-list/assets/css/editor.less';
import 'chat-list/assets/css/markdown.less';

import { DocType, IChatPlugin } from 'chat-list/types/plugin';
import { getLocalStore, setLocalStore } from 'chat-list/local/local';
import { Toaster } from "chat-list/components/ui/toaster";
import CreateAgent from 'chat-list/pages/create-agent';
import { TooltipProvider } from 'chat-list/components/ui/tooltip';
import 'chat-list/locales/i18n';
import { useTranslation } from 'react-i18next';

const router = createHashRouter(
  [
    {
      path: '/create-agent',
      element: <CreateAgent />,
    },
    {
      path: '/setting/:id',
      element: <CreateAgent />,
    },
    {
      path: '/',
      element: <ChatList />,
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
  const { t, i18n } = useTranslation('base', {
    lng: 'zh_CN',
  });

  // const [wellcome, setWellcome] = useState(getLocalStore('sheet-chat-wellcome'));
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
  root.render(<Main docType="doc" plugins={plugins} />);
};
