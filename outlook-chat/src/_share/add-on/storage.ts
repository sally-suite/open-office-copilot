import { getLocalStore, setLocalStore } from 'chat-list/local/local'

export const setUserProperty = async (key: string, value: string): Promise<void> => {
    setLocalStore(key, value)
};
export const getUserProperty = async (key: string) => {
    return getLocalStore(key);
}