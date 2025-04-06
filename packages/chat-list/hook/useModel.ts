import { useEffect, useState } from 'react';
import { USER_SET_MODEL_API_KEY, USER_SET_MODEL_API_BASE_URL, USER_SET_AI_PROVIDER, USER_SET_AI_MODEL } from 'chat-list/config/openai';
import { GptModel } from 'chat-list/types/chat';
import { getModel, setModel, getProvider, setProvider, setApiKey, getApiKey, getBaseUrl, setBaseUrl } from 'chat-list/local/local';
import { DEFAULT_MODEL } from 'chat-list/config/llm';
import userApi from '@api/user';

interface IUseModel {
    model: GptModel,
    apiKey: string,
    baseUrl: string,
    provider: string,
    setProvider: (provider: string) => void,
    setModel: (model: GptModel) => void;
    setApiKey: (provider: string, key: string) => void;
    setBaseUrl: (provider: string, url: string) => void;
    getApiKey: (provider: string) => Promise<string>;
    getBaseUrl: (provider: string) => Promise<string>;
}
export default function useModel(): IUseModel {
    // const [model, setCurrentModel] = useState<GptModel>(defaultValue)
    // const { value: model, setValue: setModelToLocal } = useLocalStore(USER_SET_AI_MODEL, defaultValue);
    const [model, setModelToLocal] = useState(DEFAULT_MODEL);
    const [provider, setProviderToLocal] = useState('');

    const setCurrentModel = async (model: GptModel) => {
        await setModel(model);
        setModelToLocal(model);
        await userApi.setUserProperty(USER_SET_AI_MODEL, model);
    };
    const setCurrentProvider = async (provider: string) => {
        await setProvider(provider);
        setProviderToLocal(provider);
        await userApi.setUserProperty(USER_SET_AI_PROVIDER, provider);
    };
    const setApiKeyByProvider = async (provider: string, key: string) => {
        setApiKey(provider, key);
        await userApi.setUserProperty(`${USER_SET_MODEL_API_KEY}_${provider}`, key);
    }
    const setBaseUrlByProvider = async (provider: string, url: string) => {
        setBaseUrl(provider, url);
        await userApi.setUserProperty(`${USER_SET_MODEL_API_BASE_URL}_${provider}`, url);
    }
    const init = async () => {
        const model = await getModel();
        const provider = await getProvider();
        setModelToLocal(model);
        setProviderToLocal(provider);
    };
    useEffect(() => {
        init();
    }, []);
    return {
        provider,
        model,
        setModel: setCurrentModel,
        setProvider: setCurrentProvider,
        setApiKey: setApiKeyByProvider,
        getApiKey,
        setBaseUrl: setBaseUrlByProvider,
        getBaseUrl
    };
}
