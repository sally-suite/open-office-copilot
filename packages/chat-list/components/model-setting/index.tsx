import React, { useEffect, useState } from 'react'
import Modal from 'chat-list/components/modal'
import { ChevronsUpDown, Loader2, Trash } from 'lucide-react';
import { Input } from 'chat-list/components/ui/input';
import { USER_SET_MODEL_API_KEY } from 'chat-list/config/openai';
import { useTranslation } from 'react-i18next';
import { getApiConfig, getApiKey, setApiKey, setLocalStore } from 'chat-list/local/local';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "chat-list/components/ui/select";

import IconButton from '../icon-button';
import { Providers } from 'chat-list/config/model';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { cn } from 'chat-list/lib/utils';
import Button from '../button';
import { Badge } from '../ui/badge';
import { formatCurrency, formatNumber } from 'chat-list/utils';
import { models as getModels } from 'chat-list/service/open-ai';

interface IApiSeting {
    provider: string;
    model: string;
    apiKey: string;
    baseUrl?: string;
    custom?: boolean;
}

interface IModelSettingProps {
    isEdit: boolean;
    open: boolean;
    onOpen: (open: boolean) => void;
    value: IApiSeting
    onChange: (value: IApiSeting) => void
    onRemove?: (model: string, provider: string) => void;
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
    const { isEdit, open, value = { provider: '', model: '', baseUrl: '', apiKey: '', custom: false }, onChange, onOpen, onRemove } = props;
    const { t } = useTranslation();

    // const [open, setOpen] = useState(visible);
    const [setting, setSetting] = useState<IApiSeting>({
        provider: '',
        model: value.model,
        baseUrl: value.baseUrl,
        apiKey: ''
    })
    const [provider, setProvider] = useState(null);
    const [models, setModels] = useState<Model[]>([])
    const [openSelectModel, setOpenSelectModel] = useState(false)

    const [loading, setLoading] = useState(false);
    const modelKey = `${USER_SET_MODEL_API_KEY}_${setting.model}`;

    const onConfirm = async () => {
        // setLocalStore(`${USER_SET_MODEL_API_KEY}_${setting.model}`, setting.apiKey || '');
        // setLocalStore(USER_SET_OPENAI_API_HOST, setting.apiHost || 'https://api.openai.com/v1');
        // await userApi.setUserProperty(modelKey, setting.apiKey || '');
        // setOpen(false);
        if (!setting.model && !setting.apiKey) {
            return;
        }

        const result = Providers.find(p => p.id === setting.provider);
        if (setting.apiKey) {
            setApiKey(setting.provider, setting.apiKey);
        }
        await onChange({
            ...setting,
            baseUrl: result.baseUrl
        });
    }
    const handleRemove = async () => {
        onClear();
        if (onRemove) {
            await onRemove(setting.model, setting.provider);
        }

    }

    const onClear = async () => {
        setLocalStore(modelKey, '');
        // await userApi.setUserProperty(modelKey, '');
        const { clear } = await getApiConfig(setting.model, setting.provider);
        await clear();
        setSetting({ ...setting, apiKey: '', baseUrl: '', model: '' });
        // setOpen(false);
    }

    // const loadKey = async () => {
    //     setLoading(true);
    //     const apiKey = await userApi.getUserProperty(modelKey);
    //     setSetting({ ...setting, apiKey });
    //     setLoading(false);
    // }

    const onValueChange = (name: string, e: any) => {
        setSetting({ ...setting, [name]: e.target.value });
    }

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

        // if (value == 'custom') {
        //     return;
        // }
        // loadModel(value);
    }

    const onModelChange = (value: any) => {
        setSetting({ ...setting, 'model': value });
    }

    const handleClickOutside = (event: React.MouseEvent) => {
        const commandPanel = document.getElementById('model_panel');
        if (commandPanel && !commandPanel.contains(event.target as Node)) {
            setOpenSelectModel(false);
        }
    };
    const loadModel = async (provider: string) => {
        setLoading(true);
        // const list = await api.getProviderModels({
        //     provider
        // })
        const list = await getModels(setting.baseUrl, setting.apiKey);
        console.log(list)
        const options = list.data.map((item: any) => {
            return {
                value: item.id,
                text: item.id,
                context_length: item?.context_length,
                pricing: item?.pricing

            }
        })
        setModels(options)
        setLoading(false);
    }

    const onLoadModels = async () => {
        await loadModel(provider.id);
        setOpenSelectModel(true);

    }

    useEffect(() => {
        if (!open) {
            return;
        }
        const { model, baseUrl, apiKey, custom, provider } = value;
        if (provider) {
            const result = Providers.find(p => p.id === provider);

            setSetting({
                model,
                baseUrl: result.baseUrl,
                apiKey,
                custom,
                provider: result.id
            })

            setProvider(result);

            // if (result.id !== 'custom') {
            //     loadModel(result.id);
            // }
        } else {
            setSetting({
                model,
                baseUrl,
                apiKey,
                custom,
                provider: 'custom'
            })

            setProvider('custom');
        }

    }, [open, value])

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
                                    )
                                })
                            }
                        </SelectContent>
                    </Select>

                </div>
                <div className="p-1">
                    <h3 className="input-label"><span className=' text-red-500'>*</span> API KEY</h3>
                    <Input placeholder={'API KEY'} value={setting.apiKey} onChange={onValueChange.bind(null, 'apiKey')} />
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
                {
                    setting.provider == 'custom' && (
                        <div className="p-1">
                            <h3 className="input-label">BASE URL</h3>
                            <Input placeholder={'https://api.openai.com/v1'} value={setting.baseUrl} onChange={onValueChange.bind(null, 'baseUrl')} />
                        </div>
                    )
                }

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
                    <Button size='sm' variant="secondary" onClick={onClear} >
                        {t('common.clear', 'Clear')}
                    </Button>
                    {
                        isEdit && (setting.custom) && (
                            <IconButton className='shrink-0 border-0 text-red-500 h-8 w-8' icon={Trash} onClick={handleRemove} >

                            </IconButton>
                        )
                    }
                </div>
            </div>
        </Modal>
    )
}
