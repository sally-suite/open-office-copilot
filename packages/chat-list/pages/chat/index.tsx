import React, { useEffect, useState } from 'react';
import LeftNavigation from 'chat-list/components/nav-left';
import ChatRender from 'chat-list/components/chat-render';
import { cn } from 'chat-list/lib/utils';
import { Menu } from 'lucide-react';
import { isMobile } from 'chat-list/utils';
import Button from 'chat-list/components/button';
import Icon from 'chat-list/components/icon';
import PreviewRender from 'chat-list/components/render-preview';

const mobile = isMobile();
const App = () => {
    const [open, setOpen] = useState(false);
    const back = () => {
        window.location.href = '/';
    };

    useEffect(() => {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.remove();
        }
    }, []);

    if (mobile) {
        return (
            <div className="flex flex-col h-screen w-full px-4 justify-center items-center overflow-auto">
                <div className=" fixed top-0 left-0 right-0 p-4 flex flex-row items-center cursor-pointer" onClick={back}>
                    <Icon
                        name="logo"
                        style={{
                            height: 40,
                            width: 40,
                        }}
                    />
                    <span className='ml-2'>
                        Sheet Chat
                    </span>
                </div>
                <div className=' border shadow rounded-lg p-2'>
                    <p className='p-2 text-2xl '>
                        Sorry, the web version is only available for desktops currently.
                    </p>
                    <Button className='my-4 text-1xl h-10 w-32 mx-auto' size='lg' onClick={back}>
                        Back
                    </Button>
                </div>

                {/* <Dialog open={true} onOpenChange={onOpenChange}>
                    <DialogContent closeable={false} className="sm:max-w-[425px]">
                        <DialogHeader className=" flex flex-col items-center mb-2">
                            <div className="mb-2" >
                                <Icon
                                    name="logo"
                                    style={{
                                        height: 80,
                                        width: 80,
                                    }}
                                />
                            </div>
                            <DialogTitle className=" text-center">Sign in</DialogTitle>
                        </DialogHeader>

                    </DialogContent>
                </Dialog> */}
            </div>
        );
    }

    return (
        <div className="flex flex-row h-screen w-full pl-24">
            <div className={cn(
                'fixed top-0 left-0 right-0 bottom-0 z-10 bg-gray-600 transition-all ',
                open ? ' opacity-50' : 'opacity-0',
                open ? '' : ' pointer-events-none'
            )}
                onClick={() => setOpen(false)}></div>

            <div className={cn(
                'fixed top-0 bottom-0 left-0 z-20 ',
                'flex-shrink-0 overflow-x-hidden bg-token-sidebar-surface-primary  bg-white',
            )}>
                <LeftNavigation onOpen={(open) => setOpen(open)} />
            </div>
            <div className="flex-1 flex h-full flex-row justify-center overflow-auto">
                <div className='w-full fixed left-0 top-0 right-0 sm:hidden'>
                    <Menu onClick={() => setOpen(!open)} />
                </div>
                <ChatRender className={cn(
                    'h-full flex-1  max-w-[700px]'
                )} />
                <PreviewRender />
            </div>
        </div>
    );
};

export default App;
