import { useEffect, useState } from 'react';
import userApi from '@api/user';
export default function useUserProperty(key: string, defaultValue?: any) {
    const [value, setValue] = useState(defaultValue);
    const [loading, setLoading] = useState(true);
    const setPropertyValue = async (value: any) => {
        setValue(value);
        await userApi.setUserProperty(key, value);
    };
    const loadValue = async () => {
        setLoading(true);
        const value = await userApi.getUserProperty(key);
        if (typeof value === 'undefined' || value == null) {
            setValue(defaultValue);
            userApi.setUserProperty(key, defaultValue);
        } else {
            setValue(value);
        }
        setLoading(false);
    };
    useEffect(() => {
        loadValue();
    }, []);
    return {
        loading,
        value,
        setValue: setPropertyValue
    };
}
