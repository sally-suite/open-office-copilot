import React, { useEffect } from 'react';
import styles from './index.module.css';
import { LANGUAGE_MAP } from 'chat-list/data/translate/languages';
import cn from 'classnames';
import { useTranslation } from 'react-i18next';

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

const LangSelector: React.FC<LangSelectorProps> = ({ value, className = '', languages = LANGUAGE_MAP, onChange }) => {
    const { t } = useTranslation(['translate', 'language']);

    return (
        <div className={styles.container}>
            <select className={cn(styles.select, className)} value={value} onChange={(e) => onChange(e.target.value)}>
                {languages.map((lng) => (
                    <option key={lng.value} value={lng.value} className={styles.option}>
                        {t(`language:${lng.value || "-"}`)}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default LangSelector;
