import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "chat-list/components/ui/select";
import React, { useEffect, useMemo, useState } from "react";
import { DEFAULT_MODEL, MODEL_LIST, VISION_MODEL_LIST } from 'chat-list/config/llm';
import { GptModel } from "chat-list/types/chat";
import { USER_SET_GEMINI_API_KEY, USER_SET_MODEL_API_BASE_URL, USER_SET_MODEL_API_KEY } from 'chat-list/config/openai';
import userApi from '@api/user'
import gptApi from '@api/gpt'
import { cn } from "chat-list/lib/utils";
import ModelSetting from 'chat-list/components/model-setting'
import { Plus, Settings } from "lucide-react"

import { getApiConfig, getLocalStore, setApiConfig, setProvider } from "chat-list/local/local";
// import useUserState from "chat-list/hook/useUserState";
import Modal from "../modal";
import useChatState from "chat-list/hook/useChatState";
import { memoize } from "chat-list/utils";
import { ModelIcon, ModelTip, VersionModelMapping } from "chat-list/config/model";
import { Badge } from "../ui/badge";

interface IModelSelectProps {
    className?: string;
    list?: GptModel[];
    value: GptModel;
    provider?: string;
    onChange: (value: GptModel, provider?: string) => void;
    type?: 'chat' | 'vision'
}

export const getModelList = memoize((version: 'free' | 'pro' | 'basic' | 'standard' | string) => {
    if (!version) {
        return MODEL_LIST.filter(item => item.value == DEFAULT_MODEL)
    }

    return MODEL_LIST;
});

const getUserModels = async () => {
    const list = await gptApi.getModels();
    return list;
}

interface IModel {
    id?: string, value: string, name: string, custom?: boolean, provider?: string
}

export const ModelSelect = (props: IModelSelectProps) => {
    const { type = 'chat', className, value: model, provider = '', onChange } = props;
    const [open, setOpen] = useState(false);
    const { plugin, user, setModel } = useChatState();

    const [models, setModels] = useState<IModel[]>([]);
    const [modelMap, setModelMap] = useState<{ [x: string]: string }>({});
    const [isAlert, setIsAlert] = useState(false)
    const [isEdit, setIsEdit] = useState(true);
    const apiLocalKey = provider ? `${USER_SET_MODEL_API_KEY}_${model}_${provider}` : `${USER_SET_MODEL_API_KEY}_${model}`;
    const apiBaseUrlKey = provider ? `${USER_SET_MODEL_API_BASE_URL}_${model}_${provider}` : `${USER_SET_MODEL_API_BASE_URL}_${model}`;
    const apiKey = getLocalStore(apiLocalKey);
    const baseUrl = getLocalStore(apiBaseUrlKey);
    const [custom, setCustom] = useState(false);
    const [loading, setLoading] = useState(true);

    const onOpen = (open: boolean) => {
        setOpen(open);
    }

    const onValueChange = async (value: string) => {

        if (value === 'new-model') {
            setIsEdit(false);
            setOpen(true)
            return;
        }

        const [model, provider = ''] = value.split('_');
        const { apiKey } = await getApiConfig(model, provider);
        if (!apiKey) {
            if (MODEL_LIST.some((p) => p.value == model) && VersionModelMapping[user.version]) {
                const list = VersionModelMapping[user.version];
                if (!list.includes(model)) {
                    setIsAlert(true);
                    return;
                }
            }
        }

        setIsEdit(true);
        const custom = !MODEL_LIST.some(p => p.value == value);
        setCustom(custom);

        onChange(model as GptModel, provider);
    }
    const onModelChange = async ({ model, apiKey, baseUrl, provider }: { model: string, apiKey: string, baseUrl: string, provider: string }) => {
        if (!provider) {
            if (model.startsWith('gpt')) {
                models.filter(p => p.value.startsWith('gpt')).forEach(async ({ value }) => {
                    await setApiConfig(value, apiKey, baseUrl);
                })
                setOpen(false);
                return;
            }
            if (model.startsWith('claude')) {
                models.filter(p => p.value.startsWith('claude')).forEach(async ({ value }) => {
                    await setApiConfig(value, apiKey, baseUrl);
                })
                setOpen(false);
                return;
            }
            if (model == 'o1-mini') {
                models.filter(p => p.value.startsWith('o1-mini')).forEach(async ({ value }) => {
                    await setApiConfig(value, apiKey, baseUrl);
                })
                setOpen(false);
                return;
            }
            if (model == 'deepseek-chat') {
                models.filter(p => p.value.startsWith('deepseek')).forEach(async ({ value }) => {
                    await setApiConfig(value, apiKey, baseUrl);
                })
                setOpen(false);
                return;
            }
        }

        // const apiLocalKey = `${USER_SET_MODEL_API_KEY}_${model}`;
        // const apiBaseUrlKey = `${USER_SET_MODEL_API_BASE_URL}_${model}`;
        // if (apiKey) {
        //     setLocalStore(apiLocalKey, apiKey)
        // }
        // if (baseUrl) {
        //     setLocalStore(apiBaseUrlKey, baseUrl)
        // }
        // 去除model首尾的空格
        const m = model.trim();
        await setApiConfig(m, apiKey, baseUrl, provider);
        await gptApi.addModel(m, provider || '');
        const list = await loadModels();
        setModels(list)
        initModelMap(list);
        setModel(model as GptModel);
        setProvider(provider);
        const custom = !MODEL_LIST.some(p => p.value == model && provider == '');
        setCustom(custom);

        setOpen(false);

    }
    const onConfirm = () => {
        setIsAlert(false);
    }
    const onRemove = async (model: string, provider: string) => {
        await gptApi.removeModel(model, provider)
        const list = await loadModels();
        setModels(list)
        initModelMap(list);
        setOpen(false);

        const m = list.find(p => p.custom);
        if (m) {
            setModel(m.value as GptModel);
            setProvider(m.provider);
            onChange(m.value as GptModel, m.provider);
        } else {
            setModel(DEFAULT_MODEL);
            setProvider('');
            onChange(DEFAULT_MODEL, '');
        }

    }
    const setDefaultModel = async (list: IModel[]) => {
        if (list.length == 0) {
            setModel(DEFAULT_MODEL);
            setProvider('');
            return;
        }
        let tarModel: IModel;
        if (model) {
            tarModel = list.find(p => p.value === model && p.provider === provider) as IModel;
            if (!tarModel) {
                tarModel = list[0];
            }
        } else {
            tarModel = list[0];

        }
        console.log('default model', tarModel)
        setModel(tarModel.value as GptModel);
        setProvider(tarModel.provider);
        const custom = !MODEL_LIST.some(p => p.value == tarModel.value && provider == '');
        setCustom(custom);

    }
    const initModelMap = async (modelList: { value: string, name: string }[]) => {
        const map = modelList.reduce((prev, cur) => {
            return {
                ...prev,
                [cur.value]: cur.name,
            }
        }, {});
        setModelMap(map);
    }

    const loadModels = async () => {
        try {
            let modelList: IModel[] = type === 'chat' ? getModelList(user?.version) : VISION_MODEL_LIST;
            if (plugin.models) {
                modelList = plugin.models.map((item) => {
                    return {
                        id: item,
                        value: item,
                        name: item,
                        custom: false,
                        provider: ''
                    }
                })
            }
            const list = await getUserModels();
            if (list) {
                const ls = list.map(item => {
                    return {
                        id: item.provider ? (item.model + "_" + item.provider) : item.model,
                        custom: true,
                        value: item.model,
                        name: item.model,
                        provider: item.provider
                    }
                });
                const sysList = modelList.map((item) => {
                    return {
                        id: item.value,
                        custom: false,
                        value: item.value,
                        name: item.name,
                        provider: ''
                    }
                })
                modelList = sysList.concat(ls);
            }
            return modelList;
        } catch (e) {
            return [];
        }
    }
    const renderModelList = () => {
        if (plugin.models && plugin.models.length > 0) {
            return plugin.models.map((item) =>
                <SelectItem hideIndicator={true} key={item} className="h-6 cursor-pointer" value={item}>
                    {item}
                </SelectItem>
            )
        }
        return models.map((item) =>
            <SelectItem hideIndicator={true} key={item.id} className="h-auto cursor-pointer" value={item.id}>
                <div className="flex flex-row items-center px-2 font-bold text-sm">
                    {
                        ModelIcon[item.id] && (
                            <img src={ModelIcon[item.id]} alt="" className="h-4 w-4 mr-1 shrink-0" />
                        )
                    }

                    {item.name}
                </div>
                {
                    ModelTip?.[item.id] && ModelTip?.[item.id].length > 0 && (
                        <div className="flex flex-row items-center space-x-1 px-1 mt-1 pl-7">
                            {
                                (ModelTip?.[item.id] || []).map((label: string) => {
                                    return (
                                        // <span key={label} className="text-xs text-gray-400 py-[1px] px-2 border border-gray-400 rounded-full">
                                        //     {label}
                                        // </span>
                                        <Badge key={label} variant="outline">
                                            {label}
                                        </Badge>

                                    )
                                })
                            }
                        </div>
                    )
                }
                {
                    item.provider && (
                        <div className="flex flex-row items-center space-x-1 px-1 mt-1">
                            <Badge variant="outline">
                                {item.provider}
                            </Badge>
                        </div>
                    )
                }
            </SelectItem>
        )
    }

    const initModelList = async () => {
        setLoading(true);
        const list = await loadModels();
        setModels(list)
        setDefaultModel(list);
        initModelMap(list);
        setLoading(false);
    }
    const selectedModel = useMemo(() => {
        return provider ? `${model}_${provider}` : model;
    }, [model, provider]);

    useEffect(() => {
        if (!user?.isAuthenticated) {
            return;
        }
        initModelList();
    }, [user?.version, user?.isAuthenticated])

    if (loading) {
        return null;
    }

    return (
        <div className="flex flex-row items-center">

            <Select
                value={selectedModel}
                onValueChange={onValueChange}
            >
                <SelectTrigger className={cn("h-6 min-w-[90px] rounded-full", className)}>
                    <SelectValue placeholder="" >
                        {modelMap[model]}
                    </SelectValue>
                </SelectTrigger>
                <SelectContent side="top" className="-left-2 max-h-[500px] ">
                    {
                        renderModelList()
                    }
                    <hr className="my-1" />
                    <SelectItem hideIndicator={true} className="h-6 cursor-pointer" value={'new-model'}>
                        <div className="flex flex-row items-center h-6 text-sm cursor-pointer" >
                            <Plus height={16} width={16} className="mx-2 shrink-0" />New Model
                        </div>
                    </SelectItem>
                </SelectContent>
            </Select>
            {
                custom && (
                    <Settings
                        className="h-4 w-4 ml-1 cursor-pointer shrink-0"
                        onClick={() => {
                            setIsEdit(true);
                            onOpen(true)
                        }}
                    />
                )
            }
            {
                !custom && (
                    <Plus
                        className="h-4 w-4 ml-1 cursor-pointer shrink-0"
                        onClick={() => {
                            setIsEdit(false);
                            setOpen(true)
                        }}
                    />
                )
            }
            {
                !isEdit && (
                    <ModelSetting isEdit={isEdit} value={{ model: '', provider: '', apiKey: '' }} onOpen={onOpen} open={open} onChange={onModelChange} />

                )
            }
            {
                isEdit && (
                    <ModelSetting isEdit={isEdit} value={{ model: model, baseUrl, apiKey, custom, provider }} onOpen={onOpen} open={open} onChange={onModelChange} onRemove={onRemove} />

                )
            }
            {
                user?.version && (
                    <Modal
                        title='Sorry~'
                        open={isAlert}
                        showConfirm={true}
                        showClose={false}
                        onConfirm={onConfirm}
                        onClose={() => {
                            setIsAlert(false)
                        }}
                        confirmText="Ok"
                    >
                        <p className="px-1">
                            The current <b>{user?.version?.toUpperCase()}</b> version you are using does not support this model. you can upgrade your plan at <a
                                className=" text-blue-700"
                                target="_blank"
                                href="https://www.sally.bot/pricing" rel="noreferrer"
                            >
                                Price & Plan
                            </a>.
                        </p>
                    </Modal>
                )
            }
        </div>

    )
}

export default ModelSelect;