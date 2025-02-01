import { setLocalStore, getLocalStore } from 'chat-list/local/local';
import React, { useEffect, useMemo, useState } from 'react'

export default function useLocalStore<T>(key: string, defaultValue?: any): { value: T, setValue: (value: T) => void } {
    const currentValue = useMemo(() => {
        return getLocalStore(key);
    }, []);
    const val = (typeof currentValue === 'undefined' || currentValue == null) ? defaultValue : currentValue;
    const [value, setValue] = useState(val);

    const setLocalValue = (value: any) => {
        setLocalStore(key, value)
        setValue(value)
    }
    useEffect(() => {
        const currentValue = getLocalStore(key);
        const val = (typeof currentValue === 'undefined' || currentValue == null) ? defaultValue : currentValue;
        setValue(val);
    }, [key]);
    return {
        value,
        setValue: setLocalValue
    }
}
