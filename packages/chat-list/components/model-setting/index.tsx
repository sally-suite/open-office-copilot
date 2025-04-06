import React, { useEffect, useState } from 'react';
import Modal from 'chat-list/components/modal';
import { ChevronsUpDown, Loader2 } from 'lucide-react';
import { Input } from 'chat-list/components/ui/input';
import { useTranslation } from 'react-i18next';
import { getModelConfig, setModelConfig } from 'chat-list/local/local';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "chat-list/components/ui/select";

import { Providers } from 'chat-list/config/model';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { cn } from 'chat-list/lib/utils';
import Button from '../button';
import { Badge } from '../ui/badge';
import { formatCurrency, formatNumber } from 'chat-list/utils';
import { models as getModels } from 'chat-list/service/open-ai';
import useChatState from 'chat-list/hook/useChatState';
import gptApi from '@api/gpt';
import { MODEL_LIST } from 'chat-list/config/llm';
import { IApiSeting } from 'chat-list/types/openai';




interface IModelSettingProps {
    open: boolean;
    onOpen: (open: boolean) => void;
    value: IApiSeting
    onSave: (value: IApiSeting) => void
    onRemove?: (id: string) => void;
    onClose?: () => void;
}


interface Pricing {
    prompt: number;
    completion: number;
    image: string;
    request: string;
}

interface Model {
    value: string;
    text: string;
    context_length?: number;
    pricing?: Pricing;
}


export default function ModelSetting(props: IModelSettingProps) {
    const { open, value, onSave, onOpen, onRemove } = props;
    const { t } = useTranslation();
    const { setApiKey, getApiKey, setBaseUrl } = useChatState();

    const [setting, setSetting] = useState<IApiSeting>({
        id: value?.id,
        provider: '',
        model: value?.model,
        baseUrl: value?.baseUrl,
        custom: value?.custom,
        apiKey: ''
    });
    const [provider, setProvider] = useState(null);
    const [models, setModels] = useState<Model[]>([]);
    const [openSelectModel, setOpenSelectModel] = useState(false);
    const [loading, setLoading] = useState(false);

    const onConfirm = async () => {
        if (!setting.model && !setting.apiKey) {
            return;
        }

        if (setting.apiKey) {
            setApiKey(setting.provider, setting.apiKey);
        }
        if (setting.baseUrl) {
            setBaseUrl(setting.provider, setting.baseUrl);
        }

        const m = setting.model.trim();
        const result = await gptApi.addModel({
            id: setting.custom ? setting.id : null,
            provider: setting.provider,
            baseUrl: setting.baseUrl,
            model: m
        });

        await setModelConfig(result.id, setting);

        await onSave({
            ...result
        });
    };
    const handleRemove = async () => {
        const inside = MODEL_LIST.some(p => p.value == setting.id);
        if (inside) {
            return;
        }
        await gptApi.removeModel(setting.id);
        if (onRemove) {
            await onRemove(setting.id);
        }
    };


    const onValueChange = (name: string, e: any) => {
        setSetting({ ...setting, [name]: e.target.value });
    };

    const onProviderChange = async (value: any) => {
        const provider = Providers.find(p => p.id == value) || null;

        setProvider(provider);

        const apiKey = await getApiKey(value);

        setSetting({
            ...setting,
            'provider': value,
            apiKey: apiKey || '',
            baseUrl: provider.baseUrl,
            'model': ''
        });

    };

    const onModelChange = (value: any) => {
        setSetting({ ...setting, 'model': value });
    };

    const handleClickOutside = (event: React.MouseEvent) => {
        const commandPanel = document.getElementById('model_panel');
        if (commandPanel && !commandPanel.contains(event.target as Node)) {
            setOpenSelectModel(false);
        }
    };
    const loadModel = async () => {
        setLoading(true);

        const list = await getModels(setting.baseUrl, setting.apiKey);
        const options = list.data.map((item: any) => {
            return {
                value: item.id,
                text: item.id,
                context_length: item?.context_length,
                pricing: item?.pricing

            };
        });
        setModels(options);
        setLoading(false);
    };

    const onLoadModels = async () => {
        await loadModel();
        setOpenSelectModel(true);

    };

    const initSetting = async () => {
        if (!value) {
            setSetting({
                id: '',
                model: '',
                baseUrl: '',
                apiKey: '',
                provider: ''
            });
            return;
        }
        const { model, custom, provider, baseUrl, id, apiKey } = value;
        if (id) {
            const modelConfig = await getModelConfig(id);
            if (modelConfig) {
                setSetting({
                    id,
                    model,
                    baseUrl: baseUrl || modelConfig.baseUrl,
                    apiKey: modelConfig.apiKey || "",
                    custom,
                    provider: provider || modelConfig.provider
                });
                setProvider(provider || modelConfig.provider);
                return;
            }
        }
        setSetting({
            id,
            model,
            baseUrl,
            apiKey: apiKey || '',
            custom,
            provider
        });

        setProvider(provider);

    }

    useEffect(() => {
        initSetting();
    }, [value]);

    return (
        <Modal
            title="MODEL SETTING"
            open={open}
            showConfirm={false}
            showClose={false}
            onClose={() => onOpen(false)}
        >
            <div onClick={handleClickOutside} className='w-full overflow-hidden'>
                <div className="p-1 space-y-1">
                    <h3 className="input-label">API Provider</h3>
                    <Select
                        value={setting.provider}
                        defaultValue={setting.provider}
                        onValueChange={onProviderChange}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select Provider" />
                        </SelectTrigger>
                        <SelectContent >
                            {
                                Providers.map((item) => {
                                    return (
                                        <SelectItem key={item.id} value={item.id} className='hover:bg-gray-100 cursor-pointer'>
                                            {item.name}
                                        </SelectItem>
                                    );
                                })
                            }
                        </SelectContent>
                    </Select>

                </div>
                <div className="p-1">
                    <h3 className="input-label"><span className=' text-red-500'>*</span> API KEY</h3>
                    <Input placeholder={'API KEY'} autoFocus value={setting.apiKey} onChange={onValueChange.bind(null, 'apiKey')} />
                </div>
                {
                    setting.apiKey && (
                        <div className="p-1 space-y-1">
                            <h3 className="input-label"><span className=' text-red-500'>*</span> Model</h3>
                            {
                                setting.provider == 'custom' && (
                                    <Input placeholder={'MODEL NAME'} value={setting.model} onChange={onValueChange.bind(null, 'model')} />
                                )
                            }
                            {
                                setting.provider != 'custom' && (

                                    <>
                                        <div id="model_panel" className='relative' >
                                            <Button
                                                size='sm'
                                                loading={loading}
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={openSelectModel}
                                                className="flex flex-row items-center sm:w-full justify-between relative overflow-hidden"
                                                onClick={onLoadModels}
                                            >
                                                {
                                                    !loading && (
                                                        <span className={cn(
                                                            'flex-1 text-left overflow-hidden font-normal whitespace-nowrap text-ellipsis pr-4',
                                                            setting.model ? "" : " text-gray-500"
                                                        )}>
                                                            {setting.model || 'Select Model'}
                                                        </span>
                                                    )
                                                }
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 absolute top-1/2 right-3 transform -translate-y-1/2" />
                                            </Button>
                                            <div className={cn(
                                                ' absolute top-10 left-0 w-full overflow-y-auto slide-in-from-top-2',
                                                openSelectModel ? "animate-in fade-in-0 zoom-in-95" : "animate-out fade-out-0 zoom-out-95 hidden"
                                            )} >
                                                <Command className='border rounded-md  border-gray-200 bg-white shadow-md z-10'>
                                                    <CommandInput
                                                        placeholder={`Search models`}
                                                        className="h-9"
                                                    />
                                                    <CommandList className='h-40'>
                                                        <CommandEmpty>
                                                            {
                                                                loading && (
                                                                    <div className='flex flex-row justify-center'>
                                                                        <Loader2 className="ml-1 rotate" width={16} height={16} />
                                                                    </div>
                                                                )
                                                            }
                                                            {
                                                                !loading && "No model found."
                                                            }
                                                        </CommandEmpty>
                                                        <CommandGroup>
                                                            {models.map((option) => (
                                                                <CommandItem
                                                                    key={option.value}
                                                                    value={option.value}
                                                                    onSelect={(currentValue) => {
                                                                        onModelChange(currentValue);
                                                                        setOpenSelectModel(false);
                                                                    }}
                                                                >
                                                                    <div className='flex flex-col overflow-hidden'>
                                                                        <div className='w-full overflow-hidden text-ellipsis whitespace-nowrap'>
                                                                            {option.text}
                                                                        </div>
                                                                        {
                                                                            option.context_length && option.pricing && (
                                                                                <div className='flex flex-row items-center space-x-2  font-normal'>
                                                                                    <Badge variant='outline' >
                                                                                        {formatNumber(option.context_length)}
                                                                                    </Badge>
                                                                                    <Badge variant='outline' >
                                                                                        {formatCurrency(option.pricing.prompt * 1000000)}-{formatCurrency(option.pricing.completion * 1000000)}/M
                                                                                    </Badge>
                                                                                </div>
                                                                            )
                                                                        }
                                                                    </div>
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </div>
                                        </div>
                                    </>

                                )
                            }

                        </div>
                    )
                }
                {/* {
                    setting.provider == 'custom' && (
                        <div className="p-1">
                            <h3 className="input-label">BASE URL</h3>
                            <Input placeholder={'https://api.openai.com/v1'} value={setting.baseUrl} onChange={onValueChange.bind(null, 'baseUrl')} />
                        </div>
                    )
                } */}
                <div className="p-1">
                    <h3 className="input-label">BASE URL</h3>
                    <Input placeholder={'https://api.openai.com/v1'} value={setting.baseUrl} onChange={onValueChange.bind(null, 'baseUrl')} />
                </div>

                {
                    provider && (
                        <p className=' text-sm p-1 mt-2'>
                            <b>Notes:  </b>
                            <ol className='ml-4 list-decimal'>
                                {
                                    provider && provider.id != 'custom' && (
                                        <li>
                                            Get API KEY at <a target="_blank" rel="noreferrer" className='link' href={provider.siteUrl}>{provider.name}</a>.
                                        </li>
                                    )
                                }
                                <li>
                                    We do not store your API KEY and BASE URL on our server; they are kept in your local storage.
                                </li>
                                <li>
                                    We recommend using models from OpenRouter.
                                </li>
                            </ol>
                        </p>
                    )
                }

                <div className='p-1 flex flex-row space-x-1 items-center mt-2'>
                    <Button size='sm' onClick={onConfirm}>
                        {t('common.confirm', 'Confirm')}
                    </Button>
                    <Button size='sm' variant="secondary" onClick={handleRemove} >
                        {t('common.remove', 'Remove')}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
