import { useEffect, useState } from 'react';
import { USER_SET_MODEL_API_KEY, USER_SET_MODEL_API_BASE_URL } from 'chat-list/config/openai';
import { GptModel } from 'chat-list/types/chat';
import useLocalStore from './useLocalStore';
import { getModel, setModel, getProvider, setProvider } from 'chat-list/local/local';
import { DEFAULT_MODEL } from 'chat-list/config/llm';

interface IUseModel {
    model: GptModel,
    apiKey: string,
    baseUrl: string,
    provider: string,
    setProvider: (provider: string) => void,
    setModel: (model: GptModel) => void;
    setApiKey: (key: string) => void;
    setBaseUrl: (url: string) => void;
}
export default function useModel(): IUseModel {
    // const [model, setCurrentModel] = useState<GptModel>(defaultValue)
    // const { value: model, setValue: setModelToLocal } = useLocalStore(USER_SET_AI_MODEL, defaultValue);
    const [model, setModelToLocal] = useState(DEFAULT_MODEL);
    const [provider, setProviderToLocal] = useState('');

    const { value: apiKey, setValue: setApiKey } = useLocalStore(`${USER_SET_MODEL_API_KEY}_${model}`, '');
    const { value: baseUrl, setValue: setBaseUrl } = useLocalStore(`${USER_SET_MODEL_API_BASE_URL}_${model}`, '');

    // const loadModel = async () => {
    //     const agentModel = getAgentModel(plugin.action);
    //     if (!agentModel) {
    //         // set agent default model
    //         setCurrentModel(plugin.models[0])
    //     } else {
    //         setCurrentModel(agentModel)
    //     }
    // }
    // const setModel = (value: GptModel) => {
    //     // setModelToLocal(value)
    //     // await userApi.setUserProperty(USER_SET_AI_MODEL, value);
    //     setCurrentModel(value);
    //     setAgentModel(plugin.action, value)
    // }
    // useEffect(() => {
    //     loadModel()
    // }, [plugin])
    const setCurrentModel = async (model: GptModel) => {
        await setModel(model);
        setModelToLocal(model);
    };
    const setCurrentProvider = async (provider: string) => {
        await setProvider(provider);
        setProviderToLocal(provider);
    };
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
        apiKey,
        baseUrl,
        setModel: setCurrentModel,
        setProvider: setCurrentProvider,
        setApiKey,
        setBaseUrl
    };
}
