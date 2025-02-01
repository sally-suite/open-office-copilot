import { SHEET_CHAT_SITE } from "chat-list/config/site";

export const login = async (licenseKey: string) => {
    const response = await fetch(`${SHEET_CHAT_SITE}/auth/login`, {
        method: 'POST',
        body: JSON.stringify({
            licenseKey
        })
    });
    const result = await response.json();
    if (result.code === 0) {
        return result.data;
    } else {
        throw new Error(result.message);
    }
};