import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next';
import { languages } from 'chat-list/locales/i18n'
import useChromeStore from 'chat-list/hook/useChromeStore'
import Checkbox from '../checkbox'

export default function index() {
    const { t, i18n } = useTranslation();
    const { value, setValue } = useChromeStore<string>('sally-extention-language', i18n.resolvedLanguage);

    const onCheckChange = async (lng: string) => {
        i18n.changeLanguage(lng);
        setValue(lng);
    }
    useEffect(() => {
        i18n.changeLanguage(value);
    }, [value])
    return (
        <div className=' text-sm grid grid-cols-3 gap-1 w-full '>
            {
                Object.keys(languages).map((key) => {
                    return (
                        <div key={key} className='flex flex-row items-center' onClick={onCheckChange.bind(null, key)}  >
                            <Checkbox
                                checked={value == key}
                            >
                            </Checkbox>
                            <span >
                                {(languages as any)[key].base.name || ''}
                            </span>
                        </div>

                    )
                })
            }
        </div>

    )
}
