import React, { useEffect, useState } from 'react';
import styles from './index.module.css';
import { IPagePlugin, SelectedRange } from '../plugins/types';
import cn from 'classnames';
import { Menu, Pin, Settings, X, } from 'lucide-react';
import Tooltip from 'chat-list/components/tooltip';
import { useTranslation } from 'react-i18next';
import DropdownMenu from '../dropdown-menu';
import useDir from '../store/useDir';

export type CloseType = 'close' | 'hide_until_next_visit' | 'disable_on_current_page' | 'disable_globally';

export interface IToolbarProps {
    selectedText?: string;
    selectedRange?: SelectedRange;
    plugins: IPagePlugin[],
    pinPlugins?: IPagePlugin[],
    active?: string,
    onChangeActive?: (id: string, params: any, e: Event) => void,
    onClose?: (type?: CloseType) => void,
    openSidePanel?: () => void,
    onPin?: (id: string) => void,
    onSetting?: (e: Event) => void,
}

const DISABLE_OPTIONS = [
    {
        value: 'hide_until_next_visit',
    },
    {
        value: 'disable_on_current_page',
    },
    {
        value: 'disable_globally',
    }
]

export default function Toolbar(props: IToolbarProps) {

    const {
        selectedText,
        selectedRange,
        plugins,
        pinPlugins = [],
        active,
        onChangeActive = () => void 0,
        onClose,
        openSidePanel,
        onPin,
        onSetting = () => void 0
    } = props;
    const { t, i18n } = useTranslation(['side'])
    const { dir } = useDir();

    const [settingOptions, setSettingOptions] = useState([])
    const onToolItemClick = (id: string, params: any, e: Event) => {
        e?.preventDefault();
        e?.stopPropagation();
        onChangeActive?.(id, params, e);
    }
    const onPinCick = (id: string, e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        onPin?.(id);
        // onClose?.();
    }
    const initSettingOptions = () => {
        let options: any = plugins.map((plg) => {
            return {
                value: plg.id,
                text: t(plg.id),
                icon: plg.icon,
            }
        })

        options = options.concat([{
            value: 'setting',
            text: t('setting'),
            icon: Settings,
        }])
        setSettingOptions(options)
    }

    useEffect(() => {
        initSettingOptions();
    }, [])

    return (
        <div className={styles.bar}   >
            {
                pinPlugins.map((plg) => {
                    let ToolItem
                    if (plg.button) {
                        const Icon = plg.button || plg.icon as any;
                        ToolItem = (
                            <div
                                key={plg.id}
                                className={cn(styles.barItem, {
                                    [styles.active]: active == plg.id,
                                })}
                            >
                                <Icon
                                    onActive={onToolItemClick.bind(null, plg.id)}
                                    selectedText={selectedText}
                                    selectedRange={selectedRange}
                                    className="text-gray-700"
                                />
                            </div>
                        )
                    } else {
                        const Icon = plg.icon as any;
                        ToolItem = (
                            <div
                                key={plg.id}
                                className={cn(styles.barItem, {
                                    [styles.active]: active == plg.id,
                                })}
                                onClick={onToolItemClick.bind(null, plg.id)}
                            >
                                <Icon
                                    height={15} width={15}
                                    selectedText={selectedText}
                                    selectedRange={selectedRange}
                                    className="text-gray-700"
                                />
                            </div>
                        )
                    }

                    if (!plg.hideTip) {
                        return (
                            <Tooltip tip={t(plg.id)} key={plg.id}>
                                {ToolItem}
                            </Tooltip>
                        )
                    } else {
                        return ToolItem
                    }
                })
            }

            <DropdownMenu
                options={settingOptions}
                renderOption={(item) => {
                    if (item.value === 'setting') {
                        return (
                            <div
                                key={item.value}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 whitespace-nowrap"
                                onClick={onSetting}
                            >
                                <span className='flex-1 flex flex-row  items-center pr-2'>
                                    <item.icon width={16} height={16} className={dir == 'ltr' ? 'mr-2' : 'ml-2'} />
                                    {item.text}

                                </span>
                            </div>
                        )
                    }
                    const pin = pinPlugins.find((plg) => plg.id == item.value);
                    return (
                        <div
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 whitespace-nowrap"
                        >
                            <span className='flex-1 flex flex-row  items-center pr-2'
                                onClick={onPinCick.bind(null, item.value)}
                            >
                                <item.icon width={16} height={16} className={dir == 'ltr' ? 'mr-2' : 'ml-2'} />
                                {item.text}
                            </span>
                            <span
                                onClick={onPinCick.bind(null, item.value)}
                            >
                                <Pin height={15} width={15}
                                    className={cn(
                                        'transition-all',
                                        {
                                            'rotate-0 text-primary': !!pin,
                                            'rotate-45': !pin
                                        }
                                    )}
                                />
                            </span>

                        </div>
                    )
                }}
                onChange={(id: string) => {
                    onToolItemClick.bind(null, id)
                }} >
                <div className={styles.barItem}>
                    <Menu height={16}
                        width={16} className={styles.textGray} />
                </div>
            </DropdownMenu>

            <DropdownMenu
                options={DISABLE_OPTIONS.map(({ value }) => {
                    return {
                        value,
                        text: t(value)
                    }
                })}
                onChange={(v: CloseType) => {
                    onClose?.(v)
                }} >
                <div className={styles.barItem} onClick={(e) => {
                    e.stopPropagation();
                    onClose?.('close')
                }} >
                    <X height={16}
                        width={16} className={styles.textGray} />
                </div>
            </DropdownMenu>
        </div>
    )
}
