import { Braces } from 'lucide-react'
import DropdownMenu from '../../dropdown-menu'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { tools } from 'chat-list/service/latex'
import { IIconButtonProps } from '../types'

export default function menu(props: IIconButtonProps) {
    const { onActive, children, className = '' } = props;
    const { t } = useTranslation(['latex'])
    const [options, setOptions] = useState([])

    const onMenuSelect = (value: string, subValue?: string) => {
        // // console.log(value)
        // const tool = options.find((item) => item.value === value)
        // // 获取鼠标位置
        // const { left, top } = getCenterPosition(450, 500);
        // setBoxPosition({ left, top })
        // setAction({ code: value, name: tool?.text || '' })
        const icon = tools.find((item) => item.code === value)?.icon
        onActive?.({ code: value, icon, subCode: subValue }, null)
    }

    const initOptions = () => {
        const opts = tools.map((item) => {
            if (item.code == 'change_tone') {
                return {
                    value: item.code,
                    text: t(item.code),
                    icon: item.icon,
                    tip: t(`${item.code}.tip`),
                }
            }
            return {
                value: item.code,
                text: t(item.code),
                icon: item.icon,
                tip: t(`${item.code}.tip`),
            }
        });
        setOptions(opts)
    }
    useEffect(() => {
        initOptions();
    }, [])

    return (
        <DropdownMenu options={options} onChange={onMenuSelect} className={className}>
            {children ? children : <Braces height={16} width={16} />}
        </DropdownMenu>
    )
}
