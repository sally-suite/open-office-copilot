import React from 'react';
import CardLayout from 'chat-list/components/card-slide-layout';
import { createRoot } from 'react-dom/client';

import 'chat-list/components/icon/svg-icons-register';
import 'chat-list/assets/css/global.css';
import 'chat-list/assets/css/common.less';
import 'chat-list/assets/css/chatui-theme.less';
import 'chat-list/assets/css/editor.less';
import 'chat-list/assets/css/markdown.less';

// import AgentStore from 'chat-list/pages/agent-store';
import 'chat-list/locales/i18n';


const elements: any = [
    {
        "type": "title",
        "top": 50,
        "left": 50,
        "width": 860,
        "height": 50,
        "title": "去日本旅行"
    },
    {
        "type": "text",
        "top": 120,
        "left": 50,
        "width": 860,
        "height": 50,
        "text": "去了东京大阪，北海道，去看了樱花，很美"
    }
];
export default function test() {
    return (
        <div>
            <CardLayout elements={elements} />
        </div>
    );
}

export const render = () => {

    const container: any = document.getElementById('root');
    const root = createRoot(container); // createRoot(container!) if you use TypeScript
    root.render(<CardLayout elements={elements} />);
};
