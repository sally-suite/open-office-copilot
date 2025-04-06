import Tooltip from 'chat-list/components/tooltip';
import { LucideIcon } from 'lucide-react';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useDir from '../store/useDir';
import { cn } from 'chat-list/lib/utils';

interface Option {
    [key: string]: any;
    value?: string;
    text?: string;
    icon?: LucideIcon;
    tip?: string;
    options?: Option[];
}

interface DropdownMenuProps {
    className?: string;
    options: Option[];
    onChange: (value: string, subValue?: string) => void;
    children: React.ReactNode;  // 允许传入自定义触发元素
    valueField?: string;
    textField?: string;
    renderOption?: (option: Option, index: number) => React.ReactNode;
    onOpen?: () => void;
    onClose?: () => void;
    align?: 'left' | 'right';
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ className, align, onOpen, onClose, valueField = 'value', textField = 'text', options, onChange, renderOption, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ top: '100%', left: 0, reverse: false });
    const buttonRef = useRef<HTMLDivElement | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const { dir } = useDir();

    useEffect(() => {
        if (!isOpen || !buttonRef.current || !menuRef.current) return;

        const handlePosition = () => {
            const buttonRect = buttonRef.current.getBoundingClientRect();
            const menuRect = menuRef.current.getBoundingClientRect();
            let reverse = false;
            let top = '100%';
            let left = align == 'left' ? 0 : (- menuRect.width / 5)

            if (buttonRect.bottom + menuRect.height > window.innerHeight) {
                top = `-${menuRect.height}px`; // 向上弹出
                reverse = true;
            }

            if (buttonRect.left + menuRect.width > window.innerWidth) {
                left = window.innerWidth - buttonRect.right - menuRect.width; // 左侧对齐
            }

            setMenuPosition({ top, left, reverse });
        };

        handlePosition();
        window.addEventListener('resize', handlePosition);
        return () => window.removeEventListener('resize', handlePosition);
    }, [isOpen, options.length]);

    const toggleMenu = () => {
        console.log(isOpen)
        setIsOpen(!isOpen)
    };
    const handleMouseEnter = () => {
        setIsOpen(true)
        if (onOpen)
            onOpen()
    };
    const handleMouseLeave = () => {
        setIsOpen(false)
        if (onClose)
            onClose()
    };

    const handleItemClick = (value: string, subValue?: string) => {
        onChange(value, subValue);
        setIsOpen(false);
        if (onClose)
            onClose()
    };
    const reverseArray = useMemo(() => {
        // 反转数组，返回一个新的数组
        const result = options.map((item, index) => options[options.length - 1 - index]);
        return result;
    }, [options]);

    const opts = menuPosition.reverse ? reverseArray : options;
    return (
        <div
            dir={dir}
            className={cn("relative w-full h-full flex items-center justify-center select-none", className)}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div ref={buttonRef} >
                {children} {/* 允许传入任意元素 */}
            </div >
            {isOpen && (
                <div ref={menuRef}
                    className=" absolute z-10 min-w-56 py-1 origin-top-right bg-transparent  animate-slide-down"
                    style={{ top: menuPosition.top, left: menuPosition.left }}
                >
                    <div
                        className=" rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 border  max-h-96 overflow-auto"
                    >
                        <div className="py-1" onClick={(e) => {
                            e.stopPropagation();
                            setIsOpen(false);
                        }}>
                            {opts.map((item, i) => {
                                if (renderOption) {
                                    return (
                                        <div key={item[valueField]} className=' relative group'>
                                            {renderOption(item, i)}
                                        </div>
                                    )
                                }
                                if (item.icon) {
                                    const ListItem = (
                                        <div key={item[valueField]} className=' relative group'>
                                            <div
                                                key={item[valueField]}
                                                onClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                                                    e.stopPropagation();

                                                    if (!item.options) {
                                                        handleItemClick(item[valueField])
                                                    }
                                                }}
                                                className="flex items-center select-none pl-4 pr-4 py-1 text-sm text-gray-700 hover:bg-gray-100 whitespace-nowrap"
                                            >
                                                <item.icon width={16} height={16} className={dir == 'ltr' ? 'mr-2' : 'ml-2'} />
                                                {item[textField]}
                                            </div>
                                            {
                                                item.options && item.options.length > 0 && (
                                                    <div className='hidden flex-col absolute right-full top-0  rounded-md shadow-lg bg-white group-hover:flex ring-1 ring-black ring-opacity-5 focus:outline-none animate-slide-down'>
                                                        {
                                                            item.options && item.options.map((subItem) => {
                                                                return (
                                                                    <div
                                                                        key={subItem[valueField]}
                                                                        className="flex items-center pl-4 pr-6 py-1 text-sm text-gray-700 hover:bg-gray-100 whitespace-nowrap"
                                                                        onClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                                                                            e.stopPropagation();
                                                                            handleItemClick(item[valueField], subItem[valueField])
                                                                        }}
                                                                    >
                                                                        {subItem[textField]}
                                                                    </div>
                                                                )
                                                            })
                                                        }
                                                    </div>
                                                )
                                            }
                                        </div>
                                    )
                                    if (item.tip) {
                                        return (
                                            <Tooltip key={item.value} tip={item.tip} className='w-full' side='right' align='end' >
                                                {ListItem}
                                            </Tooltip>

                                        )
                                    }
                                    return ListItem;

                                }
                                return (
                                    <div
                                        key={item.value}
                                        onClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                                            e.stopPropagation();
                                            handleItemClick(item[valueField])
                                        }}
                                        className="block min-w-[100px] pl-4 pr-4 py-1 cursor-pointer select-none text-sm text-gray-700 hover:bg-gray-100 whitespace-nowrap"
                                    >
                                        {item[textField]}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            )}

        </div >
    );
};

export default DropdownMenu;
