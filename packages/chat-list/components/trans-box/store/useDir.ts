import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next';

export default function useDir() {
    const { i18n } = useTranslation(['side'])

    const [dir, setDir] = useState('ltr');

    useEffect(() => {
        setDir(i18n.resolvedLanguage === 'ar' ? 'rtl' : 'ltr')
    }, [i18n.resolvedLanguage])
    return {
        dir,
        setDir
    }
}
