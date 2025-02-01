/* eslint-disable @typescript-eslint/no-unused-vars */

import React from 'react';
import Main from './main';
import { createRoot } from 'react-dom/client';
import { plugins } from 'chat-list/plugins/sheet';
import { init } from 'chat-list/service/log'
export const render = () => {
  init();
  const container: any = document.getElementById('root');
  const root = createRoot(container); // createRoot(container!) if you use TypeScript
  root.render(<Main docType="sheet" plugins={plugins} />);
};
