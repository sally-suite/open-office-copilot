/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { MouseEventHandler, useEffect, useRef, useState } from 'react';


import styles from './index.module.css';
import { Pin, Replace, X } from 'lucide-react';
import { cn } from 'chat-list/lib/utils';
import { useTranslation } from 'react-i18next';
import { FileOutput } from 'lucide-react';
import CopyButton from 'chat-list/components/copy-button'
import { insertText, replaceText } from 'chat-list/utils/writing';

import { useSelection } from '../store/useSelection';
interface IChatListProps {
    title?: string | React.ReactNode;
    renderToolbar?: () => React.ReactNode;
    position?: {
        top: number;
        left: number;
    }
    onPositionChange?: (position: { top: number, left: number }) => void;
    children: React.ReactNode;
    onClose?: () => void;
    pin?: boolean;
    onPin?: (pin?: boolean) => void;
    width?: number;
    isVisible?: boolean;
    onRender?: () => void;
    showSelectBar?: boolean;
}

const width = 450;
const height = 410;

const App = (props: IChatListProps) => {
    const { title, children, pin, onPin, position: boxPosition,
        onPositionChange, onClose, width, isVisible = true,
        onRender,
        renderToolbar,
        showSelectBar = true
    } = props;
    const { selectedRange } = useSelection();

    // const [lang, setLang] = useState(pageLanguage)
    const isFixed = useRef(false);
    const { t } = useTranslation(['side', 'base'])
    // const { value: position, setValue: setPosition } = useLocalStore<{ top: number, left: number }>(`trans-box-pos`, { top: boxPosition.top, left: boxPosition.left });
    const [position, setPosition] = useState<{ top: number, left: number }>({ top: boxPosition.top, left: boxPosition.left })
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [startY, setStartY] = useState(0);
    const [initialLeft, setInitialLeft] = useState(0);
    const [initialTop, setInitialTop] = useState(0);
    const [isRendered, setIsRendered] = useState(false);
    const [shouldAnimate, setShouldAnimate] = useState(false);
    const [selectedText, setSelectedText] = useState('');
    const [showToolbar, setShowToolbar] = useState(false);
    const toolbarRef = useRef(null);
    const [toolPosition, setToolPosition] = useState({ x: 0, y: 0 });


    const editorRef = useRef(null);

    const handleMouseDown = (e: any) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
        setStartX(e.pageX);
        setStartY(e.pageY);
        setInitialLeft(editorRef.current.offsetLeft);
        setInitialTop(editorRef.current.offsetTop);
        // setStartWidth(editorRef.current.offsetWidth);
    };

    const handleMouseMove = (e) => {

        if (!isDragging) return;

        const deltaX = e.pageX - startX;
        const deltaY = e.pageY - startY;

        editorRef.current.style.left = `${initialLeft + deltaX}px`;
        editorRef.current.style.top = `${initialTop + deltaY}px`;
        editorRef.current.style.bottom = 'auto';
        // 加入边界检查，禁止拖拽到屏幕外
        if (editorRef.current.offsetLeft < 0) {
            editorRef.current.style.left = '0px';
        }
        if (editorRef.current.offsetTop < 0) {
            editorRef.current.style.top = '0px';
        }
        if (editorRef.current.offsetLeft + editorRef.current.offsetWidth > window.innerWidth) {
            editorRef.current.style.left = `${window.innerWidth - editorRef.current.offsetWidth}px`;
        }
        if (editorRef.current.offsetTop + editorRef.current.offsetHeight > window.innerHeight) {
            editorRef.current.style.top = `${window.innerHeight - editorRef.current.offsetHeight}px`;
        }


    }

    const handleMouseUp = (e: Event) => {
        setIsDragging(false);
        isFixed.current = (true)
        setPosition({
            // bottom: screenHeight - editorRef.current.offsetTop - editorRef.current.offsetHeight,
            top: editorRef.current.offsetTop,
            left: editorRef.current.offsetLeft
        });
        // editorRef.current.style.top = 'auto'
        isFixed.current = true;
        if (onPositionChange) {
            onPositionChange({
                top: editorRef.current.offsetTop,
                left: editorRef.current.offsetLeft
            })
        }
    };

    // 当鼠标离开编辑器区域时，也停止拖动
    const handleMouseLeave = () => {
        setIsDragging(false);
    };


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

    function openSidePanel() {
        //eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        chrome?.runtime?.sendMessage({ action: "openSidePanel" });
    }

    const onPinCick = () => {
        onPin?.(!pin);
    }

    const onContentMouseUp: MouseEventHandler<HTMLDivElement> = (e) => {
        e.stopPropagation();
        if (!showSelectBar) {
            return;
        }
        setTimeout(() => {
            const selection = window.getSelection();
            const text = selection.toString().trim();

            if (text) {
                // 延迟设置位置，确保在DOM更新后进行边界检测
                setTimeout(() => {
                    const toolbarEl = toolbarRef.current;
                    if (!toolbarEl) return;

                    const toolbarRect = toolbarEl.getBoundingClientRect();
                    const viewportWidth = window.innerWidth;

                    // 计算初始位置
                    let x = e.clientX;
                    let y = e.clientY - 50; // 默认在选中文本上方40px

                    // 左右边界检测
                    if (x - toolbarRect.width / 2 < 0) {
                        // 如果超出左边界，将工具条靠左显示，留出一定边距
                        x = toolbarRect.width / 2 + 8;
                    } else if (x + toolbarRect.width / 2 > viewportWidth) {
                        // 如果超出右边界，将工具条靠右显示，留出一定边距
                        x = viewportWidth - toolbarRect.width / 2 - 8;
                    }

                    // 上边界检测
                    if (y < toolbarRect.height) {
                        // 如果上方空间不足，将工具条显示在选中文本的下方
                        y = 10;
                    }

                    setToolPosition({ x, y });
                }, 0);

                setSelectedText(text);
                setShowToolbar(true);
            }
        }, 200)

    };

    const onContentMouseDown: MouseEventHandler<HTMLDivElement> = (e) => {
        e.stopPropagation();
        // 点击toolbar以外的区域时隐藏toolbar
        if (!(e.target as HTMLDivElement).closest('.selection-toolbar')) {
            setShowToolbar(false);
        }
    };

    const onCopy = () => {
        setShowToolbar(false);
    }
    const onReplace = async () => {
        await replaceText(selectedRange, selectedText);
        setShowToolbar(false);
    }
    const onInsert = async () => {
        await insertText(selectedRange, selectedText);
        setShowToolbar(false);
    };

    useEffect(() => {
        if (!editorRef.current) {
            return;
        }
        const left = window.innerWidth - width;
        const top = window.innerHeight - (editorRef.current as HTMLElement).offsetHeight;

        setPosition({
            // bottom: screenHeight - editorRef.current.offsetTop - editorRef.current.offsetHeight,
            top: boxPosition.top > top ? top : boxPosition.top,
            left: boxPosition.left > left ? left : boxPosition.left
        });
    }, [boxPosition])

    // 处理组件的显示和隐藏
    // useEffect(() => {
    //     if (isVisible) {
    //         const left = window.innerWidth - width;
    //         const top = window.innerHeight - 500;

    //         setPosition({
    //             // bottom: screenHeight - editorRef.current.offsetTop - editorRef.current.offsetHeight,
    //             top: boxPosition.top > top ? top : boxPosition.top,
    //             left: boxPosition.left > left ? left : boxPosition.left
    //         });
    //         setIsRendered(true);
    //     } else {
    //         const timer = setTimeout(() => {
    //             setIsRendered(false);
    //         }, 300); // 等待动画结束后再移除DOM
    //         return () => clearTimeout(timer);
    //     }
    // }, [isVisible]);

    // 首次渲染动画控制
    useEffect(() => {
        if (isVisible) {
            setIsRendered(true);
            const left = window.innerWidth - width;
            const top = window.innerHeight - 500;

            setPosition({
                // bottom: screenHeight - editorRef.current.offsetTop - editorRef.current.offsetHeight,
                top: boxPosition.top > top ? top : boxPosition.top,
                left: boxPosition.left > left ? left : boxPosition.left
            });
            // 使用 requestAnimationFrame 确保在下一帧启用动画
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setShouldAnimate(true);
                });
            });
            setTimeout(() => {
                onRender?.();
            }, 100)
        } else {
            setShouldAnimate(false);
            const timer = setTimeout(() => {
                setIsRendered(false);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isVisible]);

    // 如果组件不应该被渲染，直接返回null
    if (!isRendered) return null;

    return (
        <div id="sally-container"
            // onSelect={(e) => e.stopPropagation()}
            // onSelectCapture={e => e.stopPropagation()}
            onInput={(e) => e.stopPropagation()}
            // onInputCapture={e => e.stopPropagation()}
            onFocus={(e) => e.stopPropagation()}
            onFocusCapture={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            onKeyUp={(e) => e.stopPropagation()}
        >

            {/* <textarea className='border' /> */}
            <div ref={editorRef} id="translation-popup"
                className={cn(
                    styles.container,
                    shouldAnimate ? styles.animated : styles.initial
                )}
                style={{
                    zIndex: 1000,
                    width: width || 'auto',
                    minWidth: width,
                    top: `${position.top}px`,
                    // bottom: `${position.bottom}px`,
                    left: `${position.left}px`,
                    pointerEvents: isVisible ? 'auto' : 'none',
                }}
            >
                <div className={styles.handBar} role="hand" onMouseDown={handleMouseDown}>
                    <span className={styles.hand}>
                        ==
                    </span>
                </div>
                <div className='flex flex-row text-base absolute top-2 left-3 font-medium'>
                    {title}
                </div>
                <div
                    className='flex flex-col items-center justify-center w-full bg-white rounded p-2 relative'
                    onMouseUp={onContentMouseUp}
                    onMouseDown={onContentMouseDown}
                >
                    {children}
                </div>

                {/*{
                    !isAuth && (
                        <>
                            <div className='flex flex-row space-x-1 py-2'>
                                <Input className='h-8' placeholder={t('base:common.license.input_placeholder')} value={licenseKey} onChange={onValueChange} />
                                <Button className='h-8' onClick={onLogin}>
                                    {t('base:common.login')}
                                </Button>
                            </div>
                            <div>
                                <p className="px-1 text-sm" dangerouslySetInnerHTML={{
                                    __html: t('base:common.license.desc')
                                }}>
                                </p>
                            </div>
                        </>
                    )
                } */}
                <div className="h-3" role="hand" onMouseDown={handleMouseDown}>
                    <span className={styles.hand}>
                        ==
                    </span>
                </div>
                <div className="flex flex-row items-center absolute top-2 right-3 space-x-2 text-slate-400 z-50 cursor-pointer" >
                    {
                        renderToolbar && (
                            <div className='flex flex-row text-base font-medium'>
                                {renderToolbar()}
                            </div>
                        )
                    }
                    {
                        pin !== undefined && (
                            <Pin height={15} width={15} className={cn('transition-all rotate-45', { 'rotate-0 text-primary': pin })} onClick={onPinCick} />
                        )
                    }
                    <X height={16} width={16} onClick={onClose}></X>
                </div>
            </div>
            <div
                ref={toolbarRef}
                className={`selection-toolbar fixed  z-[101000] bg-white shadow-lg border rounded-full px-0 py-0 ${showToolbar ? 'block' : 'hidden'
                    }`}
                style={{
                    left: `${toolPosition.x}px`,
                    top: `${toolPosition.y}px`,
                    transform: 'translateX(-50%)',
                }}
            >
                <div className="flex "
                    onMouseUp={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    <div className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                        onClick={onReplace}
                    >
                        <Replace className="w-4 h-4" />
                    </div>
                    <div className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                        onClick={onInsert}
                    >
                        <FileOutput className="w-4 h-4" />
                    </div>
                    <div className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
                        <CopyButton height={16} width={16} content={selectedText} onCopy={onCopy} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default App;
