import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import useForwardRef from 'chat-list/hook/useForwardRef';

// 定义输入框的变体
export enum InputVariant {
    Default = 'default',
    // 其他变体...
}

// 定义输入框的引用类型
export type InputRef = HTMLInputElement | HTMLTextAreaElement;

// 定义输入框的属性类型
export interface InputProps extends Omit<React.InputHTMLAttributes<InputRef>, 'onChange'> {
    variant?: InputVariant;
    rows?: number;
    maxLength?: number;
    maxHeight?: number;
    showCount?: boolean;
    multiline?: boolean;
    autoSize?: boolean;
    onChange?: (value: string, event: React.ChangeEvent<InputRef>) => void;
}

const TextInput = React.forwardRef<InputRef, InputProps>(function Input(props, ref) {
    const {
        variant = InputVariant.Default,
        rows = 10,
        maxLength,
        maxHeight = 150,
        showCount,
        multiline = true,
        autoSize,
        onChange,
        className,
        ...rest
    } = props;

    const inputRef = useForwardRef<any>(ref);

    const [inputValue, setInputValue] = useState<string>('');

    const handleChange = (event: React.ChangeEvent<InputRef>) => {
        const { value } = event.target;

        // 更新本地状态
        setInputValue(value);

        // 调用外部的onChange回调
        if (onChange) {
            onChange(value, event);
        }
    };

    // 根据属性动态计算类名
    const classes = clsx(
        'outline-none',
        'border-none',
        'focus:outline-none',
        'focus:border-none',
        'resize-none',
        'border',
        'rounded',
        'py-1',
        'px-1',
        'text-sm',
        {
            'border-gray-300': variant === InputVariant.Default,
        },
        className
    );
    useEffect(() => {
        if (!autoSize) {
            return;
        }
        if (!inputRef.current) {
            return;
        }
        if (!inputValue) {
            inputRef.current.style.height = 'auto';
            return;
        }
        inputRef.current.style.height = 'auto';
        if (inputRef.current.scrollHeight >= inputRef.current.offsetHeight) {
            if (inputRef.current.scrollHeight >= maxHeight) {
                inputRef.current.style.height = maxHeight + 'px';
            } else {
                inputRef.current.style.height = inputRef.current.scrollHeight + 'px';
            }
        } else {
            inputRef.current.style.height = 'auto';
            inputRef.current.rows = rows;
        }


    }, [inputValue]);
    useEffect(() => {
        if (!rest.disabled) {
            inputRef.current.focus();
        }
    }, [rest.disabled]);
    return (
        <div className="flex flex-col">
            {multiline ? (
                <textarea

                    ref={inputRef}
                    rows={rows}
                    maxLength={maxLength}
                    value={inputValue}
                    onChange={handleChange}
                    className={classes}
                    {...rest}
                />
            ) : (
                <input
                    ref={inputRef}
                    type="text"
                    maxLength={maxLength}
                    value={inputValue}
                    onChange={handleChange}
                    className={classes}
                    {...rest}
                />
            )}

            {showCount && maxLength && (
                <div className="text-sm text-gray-500 mt-1">
                    {inputValue.length}/{maxLength}
                </div>
            )}
        </div>
    );
});

export default TextInput;
