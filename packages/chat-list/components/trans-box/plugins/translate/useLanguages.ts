import useChromeStore from 'chat-list/hook/useChromeStore'
import React, { useEffect, useState } from 'react'
import { languages } from 'chat-list/locales/i18n'

export default function useLanguages() {
    const [options, setOptions] = useState([]);
    const { value: langs, setValue: setLangs, loading } = useChromeStore<{ value: string, text: string }[]>('sally-top-languages', [])

    const addLang = (lang: string) => {
        if (lang) {
            const item = { value: lang, text: lang }
            // 去重
            if (langs.findIndex(p => p.value == item.value) == -1) {
                setLangs([item].concat(langs))
            }

        }
    }
    const removeLang = (lang: string) => {
        setLangs(langs.filter(p => p.value != lang))
    }
    const initOptions = () => {
        if (langs.length == 0) {
            const opts = Object.keys(languages).map((key) => {
                return {
                    value: key,
                    text: (languages as any)[key].base.name || ''
                }
            })
            // 排除topLangs中的语言
            // opts = opts.filter((item) => langs.findIndex(p => p.value == item.value) == -1)
            const lngs = langs.concat(opts);
            // 移除add
            // const lng = options.filter((item) => item.value != 'add');
            const options = lngs.concat([{ value: 'add', text: "Input Language" }]);
            setLangs(lngs);
            setOptions(options)
        } else {
            // const lngs = langs.filter((item) => item.value != 'add');
            const options = langs.concat([{ value: 'add', text: "Input Language" }]);
            // setLangs(lngs);
            setOptions(options)
        }
    }
    const setTop = (value: string) => {
        const item = langs.find(p => p.value == value);
        if (item) {
            // 插入到第一个位置
            setLangs([item].concat(langs.filter(p => p.value != value)))
        }
    }
    useEffect(() => {
        if (loading) {
            return;
        }
        initOptions();
    }, [langs, loading])

    return {
        langs: options,
        setLangs,
        addLang,
        removeLang,
        setTop,
        loading
    }
}
