/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import Main from '../pages/main';
import { UserProvider } from 'chat-list/store/userContext';

import { createHashRouter, RouterProvider } from 'react-router-dom';

const router = createHashRouter(
  [
    {
      path: '/',
      element: <Main />,
    },
  ],
  {
    basename: '/',
  }
);

export default function routes() {
  return (
    <React.StrictMode>
      <UserProvider>
        <RouterProvider router={router} />
      </UserProvider>
    </React.StrictMode>
  );
}
