import { setChromeStore, getChromeStore } from 'chat-list/local/local';
import { useEffect, useState } from 'react';

export default function useChromeStore<T>(key: string, defaultValue?: any): { value: T, loading: boolean, setValue: (value: T) => void, reload?: () => void } {
    const [value, setValue] = useState(defaultValue);
    const [loading, setLoading] = useState<boolean>(true);
    const setLocalValue = (value: any) => {
        setChromeStore(key, value);
        setValue(value);
    };
    const init = async () => {
        setLoading(true);
        const currentValue = await getChromeStore(key);
        const val = (typeof currentValue === 'undefined' || currentValue == null || currentValue === '') ? defaultValue : currentValue;
        setValue(val);
        setLoading(false);
    };

    useEffect(() => {
        init();
    }, [key]);

    return {
        loading,
        value,
        setValue: setLocalValue,
    };
}
