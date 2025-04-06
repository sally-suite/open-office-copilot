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
import gptApi from '@api/gpt';
import { cn } from "chat-list/lib/utils";
import ModelSetting from 'chat-list/components/model-setting';
import { Plus, Settings } from "lucide-react";
import { getApiConfig, getModelConfig, setProvider } from "chat-list/local/local";
import Modal from "../modal";
import useChatState from "chat-list/hook/useChatState";
import { memoize } from "chat-list/utils";
import { ModelIcon, ModelTip } from "chat-list/config/model";
import { Badge } from "../ui/badge";
import useLocalStore from "chat-list/hook/useLocalStore";
import { USER_SET_AI_MODEL_CONFIG, USER_SET_AI_MODEL_CONFIG_VALUE } from "chat-list/config/openai";

interface IModelSelectProps {
    className?: string;
    list?: GptModel[];
    value?: GptModel;
    provider?: string;
    onChange?: (value: GptModel, provider?: string) => void;
    type?: 'chat' | 'vision'
}

export const getModelList = memoize((version: 'free' | 'pro' | 'basic' | 'standard' | string) => {
    if (!version) {
        return MODEL_LIST.filter(item => item.value == DEFAULT_MODEL);
    }

    return MODEL_LIST;
});

const getUserModels = async () => {
    const list = await gptApi.getModels();
    return list;
};

interface IModel {
    id?: string, model?: string, name?: string, custom?: boolean, provider?: string, apiKey?: string, baseUrl?: string,
}

export const ModelSelect = (props: IModelSelectProps) => {
    const { type = 'chat', className } = props;
    const [open, setOpen] = useState(false);
    const { user, setModel } = useChatState();

    const [models, setModels] = useState<IModel[]>([]);
    const [isAlert, setIsAlert] = useState(false);
    const [hasKey, setHasKey] = useState(true);
    const [loading, setLoading] = useState(true);
    const { value: currentConfig, setValue: setCurrentConfig } = useLocalStore<string>(USER_SET_AI_MODEL_CONFIG, 'gpt-4o-mini')
    const { value: currentConfigValue, setValue: setCurrentConfigValue } = useLocalStore<IModel>(USER_SET_AI_MODEL_CONFIG_VALUE, {})

    const onOpen = (open: boolean) => {
        setOpen(open);
    };

    const onValueChange = async (value: string) => {
        if (value === 'new-model') {
            setCurrentConfigValue({});
            setOpen(true);
            return;
        }
        setHasKey(true);
        const config = models.find(p => p.id == value);
        setModel(config.model as any);
        setProvider(config.provider);

        setCurrentConfig(value)
        setCurrentConfigValue(config);
        if (config.custom && !config.apiKey) {
            setHasKey(false);
        }

    };
    const onSave = async ({ id, model, provider }: IModel) => {

        setHasKey(true);
        const list = await loadModels();
        setModels(list);
        setModel(model as GptModel);
        setProvider(provider);
        setCurrentConfig(id)
        const val = list.find(p => p.id == id);
        setCurrentConfigValue(val);
        setOpen(false);

    };
    const onConfirm = () => {
        setIsAlert(false);
    };
    const onRemove = async () => {
        const list = await loadModels();
        setModels(list);
        setOpen(false);

        const m = list.find(p => p.custom == true);
        if (m) {
            setModel(m.model as GptModel);
            setProvider(m.provider);
            setCurrentConfigValue(m);
            setCurrentConfig(m.id);
        } else {
            setModel(list[0].model as GptModel);
            setProvider('');
            setCurrentConfigValue(list[0]);
            setCurrentConfig(list[0].id);
        }

    };
    const setDefaultModel = async (list: IModel[]) => {
        if (list.length == 0) {
            setCurrentConfig(DEFAULT_MODEL)
            setModel(DEFAULT_MODEL);
            setProvider('');
            setCurrentConfigValue({
                id: DEFAULT_MODEL,
                model: DEFAULT_MODEL,
                provider: '',
                custom: false
            });
            return;
        }

        let tarModel: IModel;
        if (currentConfig) {
            tarModel = list.find(p => p.id == currentConfig) as IModel;
            if (!tarModel) {
                tarModel = list[0];
            }
        } else {
            tarModel = list[0];
        }
        console.log('default model', tarModel);
        setModel(tarModel.model as GptModel);
        setProvider(tarModel.provider);
        setCurrentConfig(tarModel.id);
        setCurrentConfigValue(tarModel);

        if (tarModel.custom && !tarModel.apiKey) {
            setHasKey(false);
        }
    };

    const loadModels = async () => {
        try {
            const modelSys = type === 'chat' ? getModelList(user?.version) : VISION_MODEL_LIST;
            let modelList = modelSys.map((item) => {
                return {
                    id: item.value,
                    custom: false,
                    model: item.value,
                    name: item.name,
                    provider: ''
                };
            })
            const list = await getUserModels();
            if (list) {
                const ms = [];
                for (const item of list) {
                    let baseUrl, apiKey;
                    const config = await getModelConfig(item.id);
                    if (config) {
                        baseUrl = config.baseUrl;
                        apiKey = config.apiKey;
                    } else {
                        const setting = await getApiConfig(item.model, item.provider);
                        if (setting) {
                            baseUrl = setting.apiHost;
                            apiKey = setting.apiKey;
                        }
                    }
                    ms.push({
                        id: item.id,// item.provider ? (item.model + "_" + item.provider) : item.model,
                        custom: item.provider == 'system' ? false : true,
                        model: item.model,
                        name: item.model,
                        provider: item.provider,
                        apiKey,
                        baseUrl: item.baseUrl || baseUrl
                    })
                }
                modelList = modelList.concat(ms);
            }
            return modelList;
        } catch (e) {
            return [];
        }
    };
    const renderModelList = () => {
        return models.map((item) => {

            return (
                <SelectItem hideIndicator={true} key={item.id} className="h-auto cursor-pointer" value={item.id}>
                    <div className="flex flex-row items-center px-2 font-bold text-sm">
                        {
                            ModelIcon[item.id] && (
                                <img src={ModelIcon[item.id]} alt="" className="h-4 w-4 mr-1 shrink-0" />
                            )
                        }

                        {item.name || item.model}
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

                                        );
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
                                {
                                    (item.custom && !item.apiKey) && (
                                        <Badge variant="outline" className=" border-red-500">
                                            No API Key
                                        </Badge>
                                    )
                                }
                            </div>
                        )
                    }
                </SelectItem>
            )
        });
    };

    const initModelList = async () => {
        setLoading(true);
        const list = await loadModels();
        setModels(list);
        setDefaultModel(list);
        setLoading(false);
    };
    const currentModel = useMemo(() => {
        if (models.length <= 0) {
            return "";
        }
        if (!currentConfig) {
            return "";
        }
        return models.find(item => item.id === currentConfig).model
    }, [currentConfig, models])

    useEffect(() => {
        console.log(user)
        if (!user?.isAuthenticated) {
            return;
        }
        initModelList();
    }, [user?.version, user?.isAuthenticated]);

    if (loading) {
        return null;
    }

    return (
        <div className="flex flex-row items-center">
            <Select
                value={currentConfig}
                onValueChange={onValueChange}
            >
                <SelectTrigger className={cn(
                    "h-6 min-w-[90px] max-w-[120px] rounded-full",
                    hasKey ? "" : "border-red-500",
                    className,

                )}>
                    <SelectValue placeholder="" >
                        {currentModel}
                    </SelectValue>
                </SelectTrigger>
                <SelectContent side="top" className="-left-2 max-h-[500px] ">
                    {
                        renderModelList()
                    }
                    {
                        user.state !== 'anonymous' && (
                            <>
                                <hr className="my-1" />
                                <SelectItem hideIndicator={true} className="h-6 cursor-pointer" value={'new-model'}>
                                    <div className="flex flex-row items-center h-6 text-sm cursor-pointer" >
                                        <Plus height={16} width={16} className="mx-2 shrink-0" />New Model
                                    </div>
                                </SelectItem>
                            </>
                        )
                    }

                </SelectContent>
            </Select>
            {
                currentConfigValue.custom && (
                    <Settings
                        className="h-4 w-4 ml-1 cursor-pointer shrink-0"
                        onClick={() => {
                            onOpen(true);
                        }}
                    />
                )
            }
            {
                (user.state !== 'anonymous' && !currentConfigValue.custom) && (
                    <Plus
                        className="h-4 w-4 ml-1 cursor-pointer shrink-0"
                        onClick={() => {
                            setCurrentConfigValue({});
                            setOpen(true);
                        }}
                    />
                )
            }
            <ModelSetting
                value={currentConfigValue as any}
                onOpen={onOpen}
                open={open}
                onSave={onSave}
                onRemove={onRemove}
                onClose={() => {
                    setOpen(false);
                }}
            />
        </div>

    );
};

export default ModelSelect;