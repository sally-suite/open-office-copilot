import OpenAI from "openai";

const configCache = new Map<string, OpenAI>();

export const getOpenaiInstance = async (apiKey: string, baseUrl: string) => {
    const key = apiKey + baseUrl;
    if (configCache.has(key)) {
        return configCache.get(key);
    }
    const openai = new OpenAI({
        apiKey: apiKey,
        baseURL: baseUrl,
        defaultHeaders: {
            "HTTP-Referer": "https://www.sally.bot",
            "X-Title": "Sally",
        }
    });
    // cache the config
    configCache.set(key, openai);
    return openai;
}