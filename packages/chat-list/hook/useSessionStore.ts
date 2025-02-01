import { setSessionStore, getSessionStore } from 'chat-list/local/session';
import { useEffect, useMemo, useState } from 'react'

export default function useLocalStore(key: string, defaultValue?: any) {
    const currentValue = useMemo(() => {
        return getSessionStore(key);
    }, []);
    const val = (typeof currentValue === 'undefined' || currentValue == null) ? defaultValue : currentValue;
    const [value, setValue] = useState(val);

    const setLocalValue = (value: any) => {
        setSessionStore(key, value)
        setValue(value)
    }
    useEffect(() => {
        const currentValue = getSessionStore(key);
        const val = (typeof currentValue === 'undefined' || currentValue == null) ? defaultValue : currentValue;
        setValue(val);
    }, [key]);
    return {
        value,
        setValue: setLocalValue
    }
}
