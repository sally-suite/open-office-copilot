import React, { useEffect, useRef, useState } from 'react';
import SiderNav from 'chat-list/components/nav-sider';
import ChatRender from 'chat-list/components/chat-render'
import { cn } from 'chat-list/lib/utils';
import { X } from 'lucide-react'
import Icon from 'chat-list/components/icon';


const App = () => {
    const [open, setOpen] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [startWidth, setStartWidth] = useState(0);
    const [minWidth] = useState(300);
    const editorRef = useRef(null);
    const handleMouseDown = (e) => {
        setIsDragging(true);
        setStartX(e.pageX);
        setStartWidth(editorRef.current.offsetWidth);
    };

    // const handleMouseMove = useCallback(throttle((e) => {
    //     console.log(e)
    //     if (!isDragging) return;

    //     const newHeight = startWidth + startX - e.pageX;

    //     if (newHeight > minWidth) {
    //         editorRef.current.style.width = newHeight + 'px';
    //     }
    // }, 50), [startX, isDragging])
    const handleMouseMove = (e) => {
        console.log(e)
        if (!isDragging) return;

        const newHeight = startWidth + startX - e.pageX;

        if (newHeight > minWidth) {
            editorRef.current.style.width = newHeight + 'px';
        }
    }

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // 当鼠标离开编辑器区域时，也停止拖动
    const handleMouseLeave = () => {
        setIsDragging(false);
    };
    const back = () => {
        window.location.href = '/';
    }
    useEffect(() => {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.remove();
        }
    }, []);

    React.useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.addEventListener('mouseleave', handleMouseLeave);
        } else {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('mouseleave', handleMouseLeave);
        }
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [isDragging]);

    return (
        <div>
            <div className={cn(
                ' group flex flex-row h-10 px-1 pl-2 rounded-full fixed right-0  drop-shadow-lg bottom-16 bg-white rounded-r  items-center justify-start cursor-pointer transition-all ease-in-out'
                , open ? 'translate-x-full' : 'translate-x-0',
                'w-10 hover:w-20'
            )} onClick={() => setOpen(true)}>
                <Icon
                    name="logo"
                    style={{
                        height: 32,
                        width: 32,
                        flexShrink: 0
                    }}
                />
                <span className=' opacity-0 group-hover:opacity-100 text-gray-500'>
                    Sally
                </span>
            </div>

            <div ref={editorRef} className={cn(" fixed right-2 bg-white  h-[700px] bottom-2 flex flex-row w-96 border rounded-md overflow-hidden shadow-lg "
                , !open ? ' translate-x-[800px]' : 'translate-x-0',
                isDragging ? 'pointer-events-none' : " transition-all ease-in-out"
            )}

            >
                <div className="w-2 h-full absolute -left-0 top-0 bottom-0  cursor-col-resize z-20 " onMouseDown={handleMouseDown}></div>
                <div className="flex-1 flex h-full flex-col overflow-auto border-r">
                    <div className='w-full p-1'>
                        <X onClick={() => setOpen(!open)} className=' text-gray-500 cursor-pointer' height={20} width={20} />
                    </div>
                    <ChatRender className={cn('flex-1 w-full overflow-auto')} />
                </div>
                <div className={cn(
                    'sm:relative  sm:top-auto sm:left-auto sm:bottom-auto sm:w-10',
                    'flex-shrink-0 overflow-x-hidden bg-token-sidebar-surface-primary  bg-white'
                )}>
                    <SiderNav onOpen={(open) => setOpen(open)} />
                </div>
            </div>

        </div>
    );
};

export default App;
