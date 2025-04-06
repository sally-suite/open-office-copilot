import React, { useEffect, useState } from 'react';
import SiderNav from 'chat-list/components/nav-sider';
import ChatRender from 'chat-list/components/chat-render'
import { cn } from 'chat-list/lib/utils';


const App = () => {
    const [open, setOpen] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [startWidth, setStartWidth] = useState(0);
    const [minWidth] = useState(300);
    // const editorRef = useRef(null);
    // const handleMouseDown = (e) => {
    //     setIsDragging(true);
    //     setStartX(e.pageX);
    //     setStartWidth(editorRef.current.offsetWidth);
    // };

    // const handleMouseMove = useCallback(throttle((e) => {
    //     console.log(e)
    //     if (!isDragging) return;

    //     const newHeight = startWidth + startX - e.pageX;

    //     if (newHeight > minWidth) {
    //         editorRef.current.style.width = newHeight + 'px';
    //     }
    // }, 50), [startX, isDragging])
    // const handleMouseMove = (e) => {
    //     console.log(e)
    //     if (!isDragging) return;

    //     const newHeight = startWidth + startX - e.pageX;

    //     if (newHeight > minWidth) {
    //         editorRef.current.style.width = newHeight + 'px';
    //     }
    // }

    // const handleMouseUp = () => {
    //     setIsDragging(false);
    // };

    // // 当鼠标离开编辑器区域时，也停止拖动
    // const handleMouseLeave = () => {
    //     setIsDragging(false);
    // };
    // const back = () => {
    //     window.location.href = '/';
    // }
    useEffect(() => {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.remove();
        }
    }, []);

    // React.useEffect(() => {
    //     if (isDragging) {
    //         document.addEventListener('mousemove', handleMouseMove);
    //         document.addEventListener('mouseup', handleMouseUp);
    //         document.addEventListener('mouseleave', handleMouseLeave);
    //     } else {
    //         document.removeEventListener('mousemove', handleMouseMove);
    //         document.removeEventListener('mouseup', handleMouseUp);
    //         document.removeEventListener('mouseleave', handleMouseLeave);
    //     }
    //     return () => {
    //         document.removeEventListener('mousemove', handleMouseMove);
    //         document.removeEventListener('mouseup', handleMouseUp);
    //         document.removeEventListener('mouseleave', handleMouseLeave);
    //     };
    // }, [isDragging]);
    // console.log('app')
    return (
        <div className="flex flex-row h-screen w-full">
            <div className="flex-1 flex h-full flex-col overflow-auto border-r">
                <ChatRender className={cn('flex-1 w-full overflow-auto')} />
            </div>
            <div className={cn(
                'sm:relative  sm:top-auto sm:left-auto sm:bottom-auto sm:w-10',
                'flex-shrink-0 overflow-x-hidden bg-token-sidebar-surface-primary  bg-white'
            )}>
                <SiderNav onOpen={(open) => setOpen(open)} />
            </div>
        </div>
    );
};

export default App;
