import React from 'react';

import { createRoot } from 'react-dom/client';
import App from 'chat-list/pages/side/index.content';
import { init } from 'chat-list/service/log'
import 'chat-list/components/icon/svg-icons-register';
import 'chat-list/assets/css/global.css';
import 'chat-list/assets/css/common.less';
import 'chat-list/assets/css/markdown.less';

import 'chat-list/locales/i18n';
import { TooltipProvider } from 'chat-list/components/ui/tooltip';
// import { UserProvider } from 'chat-list/store/userContext';
// import { ChatProvider } from 'chat-list/store/chatContext';
// import { Toaster } from "chat-list/components/ui/toaster";
// import { useTranslation } from 'react-i18next';
// import { plugins } from 'chat-list/plugins/side';
// import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import './shadow-dom'
import { SALLY_ROOT_TAG, SALLY_ROOT_ID } from "chat-list/config/side"

// const router = createMemoryRouter(
//     [
//         {
//             path: '/',
//             element: <App />,
//         },
//     ],
//     {
//         basename: '/',
//     }
// );


export default function Main() {
    // const { t, i18n } = useTranslation('base', {
    //     lng: 'en-US',
    // });

    // useEffect(() => {
    //   const loading = document.getElementById('loading');
    //   if (loading) {
    //     loading.remove();
    //   }
    // }, []);
    return (
        <React.StrictMode>
            <TooltipProvider>
                {/* <UserProvider>
                    <ChatProvider key={i18n.resolvedLanguage} docType={'doc'} plugins={plugins}>
                        <RouterProvider router={router} />
                        <Toaster />
                    </ChatProvider>
                </UserProvider> */}
                {/* <RouterProvider router={router} /> */}
                <App />
            </TooltipProvider>
        </React.StrictMode>
    );
}

export const render = async () => {

    init();

    // let container: any = document.getElementById('__sally_chat__');
    // if (!container) {
    //     container = document.createElement('div');
    //     container.id = '__sally_chat__';
    //     document.body.appendChild(container);
    // }

    // const root = createRoot(container); // createRoot(container!) if you use TypeScript
    // root.render(<Main />);

    const container = document.createElement(SALLY_ROOT_TAG)
    container.id = SALLY_ROOT_TAG;
    container.className = SALLY_ROOT_TAG
    container.style.position = 'relative';
    container.style.zIndex = "10000000000";
    container.style.fontSize = "16px";
    document.documentElement.append(container)

    const root = createRoot(container.shadowRoot.querySelector(`#${SALLY_ROOT_ID}`)); // createRoot(container!) if you use TypeScript
    root.render(<Main />);
};
