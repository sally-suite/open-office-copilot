import { getLocalStore, setLocalStore } from 'chat-list/local/local'

export const setUserProperty = async (key: string, value: string) => {
    setLocalStore(key, value);
}
export const getUserProperty = async (key: string) => {
    return getLocalStore(key);
}