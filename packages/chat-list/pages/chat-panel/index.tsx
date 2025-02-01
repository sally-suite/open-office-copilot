import React, { useEffect } from 'react';
import SiderNav from 'chat-list/components/nav-sider';
import ChatRender from 'chat-list/components/chat-list';
import { cn } from 'chat-list/lib/utils';


const App = () => {

    useEffect(() => {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.remove();
        }
    }, []);


    return (
        <div className="flex flex-row h-screen w-full">
            {/* <div className="flex-1 flex h-full flex-col overflow-auto border-r"> */}
            <ChatRender className={cn('flex-1 w-full overflow-auto')} />
            {/* </div> */}
            <div className={cn(
                'hidden sm:relative  sm:top-auto sm:left-auto sm:bottom-auto sm:w-10 border-l',
                'flex-shrink-0 overflow-x-hidden bg-token-sidebar-surface-primary  bg-white',
                ' 2xs:hidden xs:block sm:block'
            )}>
                <SiderNav />
            </div>
        </div>
    );
};

export default App;
