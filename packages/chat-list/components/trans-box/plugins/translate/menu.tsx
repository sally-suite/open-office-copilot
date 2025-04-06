import { ArrowUpFromLine, Languages, Plus, Trash } from 'lucide-react'
import DropdownMenu from '../../dropdown-menu'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { IIconButtonProps } from '../types'
import useDir from '../../store/useDir'
import { Input } from 'chat-list/components/ui/input'
import useLanguages from './useLanguages';

export default function menu(props: IIconButtonProps) {
    const { onActive, children, className } = props;
    const { t } = useTranslation(['latex']);
    const { dir } = useDir()
    // const [options, setOptions] = useState([]);
    const {
        langs,
        setLangs,
        addLang,
        removeLang,
        setTop,
        loading
    } = useLanguages();
    // const { value: topLangs, setValue: setTopLangs, loading } = useChromeStore<{ value: string, text: string }[]>('sally-top-languages', [])
    const [lang, setLang] = useState('')
    const onMenuSelect = (value: string, subValue?: string) => {
        // // console.log(value)
        // const tool = options.find((item) => item.value === value)
        // // 获取鼠标位置
        // const { left, top } = getCenterPosition(450, 500);
        // setBoxPosition({ left, top })
        // setAction({ code: value, name: tool?.text || '' })
        // const icon = options.find((item) => item.value === value);
        onActive?.({ code: value, subCode: subValue }, null)
    }
    const onUpCick = (value: string, e: Event) => {
        e.stopPropagation();
        setTop(value);
    }
    const onAdd = (e: any) => {
        e.stopPropagation()
        if (lang) {
            addLang(lang);
            setLang('');
        }
    }

    const onRemove = (value: string, e: any) => {
        e.stopPropagation();
        if (value) {
            removeLang(value);
        }
    }

    return (
        <DropdownMenu
            className={className}
            options={langs}
            onChange={onMenuSelect}
            renderOption={(item, i) => {
                if (item.value == 'add') {
                    return (
                        <div
                            key={'add'}
                            className="flex select-none flex-row items-center px-4 py-1 text-sm text-gray-700 hover:bg-gray-100 whitespace-nowrap"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Input
                                className='flex-1 h-8 rounded-sm w-[140px]'
                                value={lang} onChange={(e) => {
                                    setLang(e.target.value)
                                }}
                                onKeyDown={(e) => {
                                    if (e.key == 'Enter') {
                                        onAdd(e)

                                    }
                                }}
                                placeholder={'Input Language'}
                            >
                            </Input>
                            <span className='w-4 ml-1' onClick={onAdd}>
                                <Plus height={16} width={16} />
                            </span>
                        </div>
                    )
                }
                return (
                    <div
                        className="flex select-none items-center px-4 py-1 space-x-1 text-sm text-gray-700 hover:bg-gray-100 whitespace-nowrap group"

                    >
                        <span className='flex-1 flex flex-row min-w-[100px] items-center pr-2' onClick={onMenuSelect.bind(null, item.value)}>
                            {item.text}
                        </span >
                        {
                            i > 0 && (
                                <span
                                    className='group-hover:block hidden'
                                    onClick={onUpCick.bind(null, item.value)}
                                >
                                    <ArrowUpFromLine height={15} width={15} />
                                </span>
                            )
                        }
                        <span
                            className='group-hover:block hidden'
                            onClick={onRemove.bind(null, item.value)}
                        >
                            <Trash height={15} width={15} />
                        </span>
                    </div >
                )
            }}
        >
            {children ? children : <Languages height={16} width={16} />}
        </DropdownMenu>
    )
}
