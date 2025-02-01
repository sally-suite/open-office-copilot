import React, { useEffect, useState } from 'react'
import themes from 'chat-list/data/slides/theme.json'
import fontConfig from 'chat-list/data/slides/font.json';
// import colorConfig from './data/theme.json';
import Tooltip from 'chat-list/components/tooltip'
import { useTranslation } from 'react-i18next';


export interface ThemeItem {
    name: string;
    colors: {
        primary: string;
        background: string;
        text: string;
        highlight: string;
        complementary: string;
    };
    fonts: {
        title: string;
        body: string;
        web: {
            title: string;
            body: string;
        },
    };
}

interface ThemeSelectorProps {
    value?: string;
    onChange: (theme: ThemeItem) => void
}

export default function ThemeSelector(props: ThemeSelectorProps) {
    const { value, onChange } = props;
    const { i18n } = useTranslation();
    const fonts = (fontConfig as any)[i18n.resolvedLanguage] || fontConfig['en-US'];
    const [selectedTheme, setSelectedTheme] = useState<number>(0)

    const onSelect = (index: any) => {
        const theme = themes[index];
        const ff = fonts.find((p: any) => p.code == theme.name);
        const tarTheme = {
            name: theme.name,
            colors: themes.find(p => p.primary == theme.primary),
            fonts: {
                title: ff?.title || '',
                body: ff?.body || '',
                web: {
                    title: ff?.web?.title || '',
                    body: ff?.web?.body || '',
                },
            }
        }
        setSelectedTheme(index)
        onChange?.(tarTheme)
    }

    useEffect(() => {
        if (value) {
            const i = themes.findIndex((p) => p.name == value)
            onSelect(i)
        } else {
            onSelect(0)
        }
    }, [])

    return (
        <div className=" bg-white ">
            <h2 className="font-bold mb-2 text-gray-800">
                {i18n.t('common.theme')}
            </h2>
            <div className="w-full whitespace-nowrap rounded-md ">
                <div className=" grid grid-cols-4 gap-2 place-items-center md:flex md:flex-row md:items-center ">
                    {themes.map((theme, i) => {
                        return (
                            <Tooltip tip={theme.name} key={i} className='w-full'>
                                <div
                                    className={`px-2 text-white py-2 h-8 w-full leading-4 rounded cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-105 ${selectedTheme === i ? 'ring-2 ring-offset-2 ring-blue-300' : ''
                                        }`}
                                    style={{
                                        backgroundColor:
                                            theme.primary,
                                    }}
                                    onClick={() => onSelect(i)}

                                >
                                </div>
                            </Tooltip>

                        )
                    })}
                </div>
            </div>
            {/* <h2 className="font-bold mb-4 text-gray-800">Font</h2>
            <div className="flex flex-wrap gap-2">
                {fonts.map((pairing, index) => (
                    <button
                        key={index}
                        onClick={() => onSelect(index)}
                        className={`px-2 py-1 rounded-md transition-colors`}
                    >
                        {pairing.name}
                    </button>
                ))}
            </div> */}
        </div>
    )
}