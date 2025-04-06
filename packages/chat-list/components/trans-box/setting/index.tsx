import React, { useEffect, useState } from 'react';
import styles from './index.module.css';
import plugins from '../plugins'
// import useChromeStore from 'chat-list/hook/useChromeStore';
import Checkbox from '../checkbox';
import { useTranslation } from 'react-i18next';
import LanguageSwitch from '../language-switch'
import useDir from '../store/useDir';
import { Input } from 'chat-list/components/ui/input';
import { getApiConfig, getModel, getProvider, setApiConfig, setModel, setProvider } from 'chat-list/local/local';
import DropdownMenu from '../dropdown-menu';
import { Button } from 'chat-list/components/ui/button';
import { Badge } from 'chat-list/components/ui/badge';

import gptApi from '@api/gpt'
import api from '@api/index'
import { formatCurrency, formatNumber } from 'chat-list/utils';
import Loading from 'chat-list/components/loading';

export interface ISettingProps {
    disableSetting: { localDisable: boolean, globalDisable: boolean },
    list: { id: string, name: string }[]
    onClose: () => void;
    onChange: (list: { id: string, name: string }[]) => void;
    onDisableSetting: (disableSetting: { localDisable: boolean, globalDisable: boolean }) => void;
}

export default function Setting(props: ISettingProps) {
    const { list, onChange, disableSetting = { localDisable: false, globalDisable: false }, onDisableSetting, onClose } = props;
    const { t } = useTranslation('side')
    const { dir } = useDir();
    const [open, setOpen] = useState(false)
    const [models, setModels] = useState<{ value: string, text: string }[]>([])
    const [allModels, setAllModels] = useState<{ value: string, text: string }[]>([])
    const [loading, setLoading] = useState(false);

    const [setting, setSetting] = useState<{ model: string, provider: string, apiKey: string, baseUrl: string, custom?: boolean }>({
        provider: 'openrouter',
        model: '',
        baseUrl: 'https://openrouter.ai/api/v1',
        apiKey: ''
    })
    const [plgs, setPlgs] = useState([])
    const onCheckPlugins = (id: string) => {
        const checked = list.find(p => p.id === id) ? true : false;
        if (!checked) {
            onChange(list.concat({ id, name: plugins.find(item => item.id === id)?.name }));
        } else {
            onChange(list.filter(item => item.id !== id));

        }
    }

    const onCheckChange = (name: string) => {
        const v: any = { ...disableSetting };
        v[name] = !v[name];
        onDisableSetting?.(v);
    }

    const onValueChange = async (name: string, e: any) => {
        setSetting({ ...setting, [name]: e.target.value });
    }

    const onConfirm = async () => {
        if (!setting.apiKey || !setting.model) {
            setApiConfig('gpt-4o-mini', '', '', '');
            setModel('gpt-4o-mini');
            setProvider('');
            onClose?.();
            return;
        }
        setApiConfig(setting.model, setting.apiKey, setting.baseUrl, setting.provider);
        setModel(setting.model);
        setProvider(setting.provider);
        await gptApi.addModel({
            model: setting.model,
            provider: setting.provider,
            baseUrl: setting.baseUrl
        })
        onClose?.();
    }

    const onModelChange = (value: string) => {
        setSetting({ ...setting, model: value });
    }
    const loadModel = async () => {
        setLoading(true);
        const list = await api.getProviderModels({
            provider: setting.provider
        })
        const options = list.data.map((item: any) => {
            return {
                value: item.id,
                text: item.id,
                context_length: item?.context_length,
                pricing: item?.pricing

            }
        })
        setModels(options)
        setAllModels(options)
        setLoading(false);
    }
    const onModelInput = (e: any) => {
        const value = e.target.value;
        setSetting({ ...setting, model: value });
        const options = allModels.filter(item => item.text.includes(value))
        setModels(options)

    }

    const initKey = async () => {
        const provider = await getProvider();
        if (!provider) {
            return;
        }
        const model = await getModel();
        const config = await getApiConfig(model, provider);
        setSetting({
            ...setting,
            model: config.model,
            apiKey: config.apiKey,
            // baseUrl: config.apiHost || 'https://openrouter.ai/api/v1'
        });
    }
    useEffect(() => {
        const ps = list.map(item => {
            return plugins
                .find(item2 => item2.id === item.id)
        }).filter(item => item)
        setPlgs(ps);

    }, [list])

    useEffect(() => {
        initKey();
        loadModel();
    }, [])

    return (
        <div dir={dir} className={styles.setting}>
            {/* <div className='mt-4'>
                <div className="text-base font-bold">
                    🛠️ {t('toolbar_setting')}
                </div>
                <div className={styles.toolbar}>
                    <Toolbar plugins={plgs} openSidePanel={null} />
                </div>
                <div className={styles.plugins}>
                    {
                        plugins.map((item, index) => {
                            const Icon = item.icon;
                            return (
                                <div key={index} className="flex flex-row items-center justify-center mx-1 cursor-pointer" onClick={onCheckPlugins.bind(null, item.id)}>
                                    <Checkbox checked={list.find(p => p.id === item.id) ? true : false} onChange={() => void 0} />
                                    <span onClickCapture={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        onCheckPlugins(item.id)
                                    }}>
                                        <Icon height={16} width={16} className=' flex-shrink-0' />
                                    </span>
                                    <span className='ml-1 text-sm whitespace-nowrap'>
                                        {t(item.id, item.name)}
                                    </span>
                                </div>
                            )
                        })
                    }
                </div>
            </div> */}
            <div className='mt-4'>
                <div className="text-base font-bold">
                    {t('language_setting')}
                </div>
                <div className={styles.toolbar}>
                    <LanguageSwitch />
                </div>
            </div>
            <div className='mt-4'>
                <div className="text-base font-bold">
                    {t('disable_setting')}
                </div>
                <div className="flex flex-col items-start text-sm mt-2 mb-4">
                    <div className="flex flex-row items-center justify-center cursor-pointer" onClick={onCheckChange.bind(null, 'localDisable')}>
                        <Checkbox checked={disableSetting.localDisable} onChange={() => void 0} />
                        {t('disable_on_current_page')}
                    </div>
                    <div className="flex flex-row items-center justify-center cursor-pointer" onClick={onCheckChange.bind(null, 'globalDisable')}>
                        <Checkbox checked={disableSetting.globalDisable} onChange={() => void 0} />
                        {t('disable_globally')}
                    </div>
                </div>
            </div>
            <div className='mt-4'>
                <div className="text-base font-bold">
                    MODEL SETTING
                </div>
                <div className="flex flex-col items-start text-sm mt-2 mb-4">
                    <div className="p-1 w-full flex flex-row items-center">
                        <h3 className="input-label w-24 shrink-0 mr-2">AI Provider</h3>
                        <div className='flex flex-row justify-start'>
                            OpenRouter
                        </div>
                    </div>
                    <div className="p-1 w-full flex flex-row items-center">
                        <h3 className="input-label w-24 shrink-0 mr-2">MODEL:</h3>
                        <div className='flex flex-row justify-start'>
                            {/* <Input placeholder={'MODEL NAME'} value={setting.model} onChange={onValueChange.bind(null, 'model')} /> */}
                            <DropdownMenu
                                align="left"
                                className='w-full py-2 cursor-pointer'
                                options={models}
                                onClose={() => {
                                    setOpen(false)
                                }}
                                onOpen={() => {
                                    setOpen(true)
                                }}
                                onChange={onModelChange}
                                renderOption={(option) => {
                                    return (
                                        <div className='flex flex-col w-[250px] bg-white items-start justify-center px-1 py-1 hover:bg-gray-100 rounded m-1 overflow-hidden' onClick={() => {
                                            onModelChange(option.value)
                                        }}>
                                            <div className="flex flex-row items-center p-1 font-bold text-sm shrink-0">
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
                                    )
                                }}
                            >
                                <span className='flex flex-row items-center font-semibold group h-4'>
                                    {
                                        loading && (
                                            <Loading className='h-4 w-4 mr-2' />
                                        )
                                    }
                                    {
                                        !loading && (
                                            <>
                                                <Input value={setting.model} className='w-[280px]' onChange={onModelInput} />
                                                {/* <ChevronUp className={(cn(
                                                    'h-4 w-4 group-hover:rotate-180 transition-all duration-300 ease-in-out ml-2',
                                                    open ? "rotate-180" : ""))
                                                } /> */}
                                            </>
                                        )
                                    }
                                </span>
                            </DropdownMenu>
                        </div>
                    </div>
                    <div className="p-1 w-full flex flex-row items-center">
                        <h3 className="input-label mr-2 whitespace-nowrap w-24 shrink-0 ">API KEY:</h3>
                        <Input placeholder={'API KEY'} value={setting.apiKey} className='w-[280px]' onChange={onValueChange.bind(null, 'apiKey')} />
                    </div>
                    {/* <div className="p-1 w-full flex flex-row items-center">
                        <h3 className="input-label whitespace-nowrap mr-2 w-24 shrink-0 ">BASE URL:</h3>
                        <Input placeholder={'https://openrouter.ai/api/v1'} value={setting.baseUrl} onChange={onValueChange.bind(null, 'baseUrl')} />
                    </div> */}
                    <div className='p-1'>
                        You can get MODEL and API KEY at: <a className='link' target='_blank' rel="noreferrer" href="https://openrouter.ai/" >OpenRouter</a>.
                    </div>
                </div>
            </div>
            <div className='p-1 flex flex-row space-x-1 items-center justify-end'>
                <Button size='sm' onClick={onConfirm} >
                    {t('base:common.confirm', 'Confirm')}
                </Button>
                <Button size='sm' variant='secondary' onClick={() => {
                    onClose?.();
                }}>
                    {t('base:common.close', 'Close')}
                </Button>
            </div>
        </div>
    )
}
