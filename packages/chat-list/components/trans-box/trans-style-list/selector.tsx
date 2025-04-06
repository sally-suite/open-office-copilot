import React, { useEffect, useState } from 'react';
import { TRANSLATE_STYLE } from "chat-list/data/translate/languages";
import { useTranslation } from 'react-i18next';
import DropdownMenu from '../dropdown-menu'
import { ChevronDown } from 'lucide-react';
import Button from '../button';
export type ILangItem = {
    value: string;
    text: string;
};

interface LangSelectorProps {
    className?: string;
    value: string;
    languages?: ILangItem[];
    onChange: (value: string) => void;
}

const LangSelector: React.FC<LangSelectorProps> = ({ value, className = '', onChange }) => {
    const { t } = useTranslation('translate');
    const [options, setOptions] = useState([])

    useEffect(() => {
        setOptions(TRANSLATE_STYLE.map((item) => ({
            value: item.value,
            text: t(`tone.${item.value}`, item.label)
        })))
    }, [])
    return (
        // <div className={styles.container}>
        //     <select className={cn(styles.select, className)} value={value} onChange={(e) => onChange(e.target.value)}>
        //         {TRANSLATE_STYLE.map((item) => (
        //             <option key={item.value} value={item.value} className={styles.option}>
        //                 {t(`tone.${item.value}`, item.label)}
        //             </option>
        //         ))}
        //     </select>
        // </div>
        <DropdownMenu options={options} onChange={onChange}  >
            <Button className='flex flex-row items-center h-8 py-0 px-2'>

                <div className='flex flex-row select-none items-center text-sm'>
                    <span className='mr-1'>
                        {value ? t(`tone.${value}`) : "Select tone"}
                    </span>
                    <span className='hover:rotate-180 transition-all duration-200 ease-in-out' >
                        <ChevronDown height={16} width={16} />
                    </span>
                </div>
            </Button>
        </DropdownMenu>
    );
};

export default LangSelector;
