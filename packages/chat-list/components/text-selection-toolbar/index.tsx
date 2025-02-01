import React, { useState, useEffect, useRef } from 'react';
import { FileOutput, Quote } from 'lucide-react';
import CopyButton from 'chat-list/components/copy-button';
import useChatState from 'chat-list/hook/useChatState';
import docApi from '@api/doc';
import slideApi from '@api/slide';
import emailApi from '@api/email';

import { buildHtml, removeMentions } from 'chat-list/utils';
const TextSelectionToolbar = () => {
    const [showToolbar, setShowToolbar] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [selectedText, setSelectedText] = useState('');
    const { setDataContext, docType } = useChatState();
    const toolbarRef = useRef(null);

    useEffect(() => {
        const handleMouseUp = (e: MouseEvent) => {
            setTimeout(() => {
                const selection = window.getSelection();
                const text = selection.toString().trim();

                if (text) {
                    // 延迟设置位置，确保在DOM更新后进行边界检测
                    setTimeout(() => {
                        const toolbarEl = toolbarRef.current;
                        if (!toolbarEl) return;

                        // const toolbarRect = toolbarEl.getBoundingClientRect();
                        const viewportWidth = window.innerWidth;
                        const toolWidth = 32 * 3;
                        const toolHeight = 32;
                        // 计算初始位置
                        let x = e.clientX;
                        let y = window.scrollY + e.clientY - 50; // 默认在选中文本上方40px

                        // 左右边界检测
                        if (x - toolWidth / 2 < 0) {
                            // 如果超出左边界，将工具条靠左显示，留出一定边距
                            x = toolWidth / 2 + 8;
                        } else if (x + toolWidth / 2 > viewportWidth) {
                            // 如果超出右边界，将工具条靠右显示，留出一定边距
                            x = viewportWidth - toolWidth / 2 - 8;
                        }

                        // 上边界检测
                        if (y < toolHeight) {
                            // 如果上方空间不足，将工具条显示在选中文本的下方
                            y = window.scrollY + 10;
                        }
                        setPosition({ x, y });
                        setShowToolbar(true);
                    }, 100);

                    setSelectedText(text);

                }
            }, 200);

        };

        const handleMouseDown = (e: any) => {
            // 点击toolbar以外的区域时隐藏toolbar
            if (!e.target.closest('.selection-toolbar')) {
                setShowToolbar(false);
            }
        };

        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('mousedown', handleMouseDown);

        return () => {
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('mousedown', handleMouseDown);
        };
    }, []);

    const onCopy = () => {
        setShowToolbar(false);
    };

    const onInsert = async () => {
        const content = selectedText;
        const result = removeMentions(content);
        const html = await buildHtml(result);
        // if (platform == 'office') {
        //     await docApi.insertText(html, {
        //         type: 'html'
        //     });
        // } else {
        //     await docApi.insertText(result);
        // }
        if (docType == 'doc' || docType == 'side') {
            await docApi.insertText(html, {
                type: 'html',
                text: result,
            });
        } else if (docType == 'slide') {
            await slideApi.insertText(result);
        } else if (docType == 'email') {
            await emailApi.insertText(html, {
                type: 'html',
                text: result,
            });
        }
        setShowToolbar(false);
    };

    const onQuote = () => {
        setDataContext(selectedText);
        setShowToolbar(false);
    };

    return (
        <div
            ref={toolbarRef}
            className={`selection-toolbar fixed  z-[101000] bg-white shadow-lg border rounded-full px-0 py-0 ${showToolbar ? 'block' : 'hidden'
                }`}
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                transform: 'translateX(-50%)',
            }}
        >
            <div className="flex "
                onMouseUp={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
            >
                <div className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
                    <CopyButton height={16} width={16} content={selectedText} onCopy={onCopy} />
                </div>
                <div className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                    onClick={onInsert}
                >
                    <FileOutput className="w-4 h-4" />
                </div>
                <button
                    onClick={onQuote}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                >
                    <Quote className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default TextSelectionToolbar;