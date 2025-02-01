import React, { useContext, useEffect, useState } from 'react';
import { Card, CardTitle, CardContent, CardActions } from '../ui/card';
import Button from '../button';
import { Loader2 } from 'lucide-react';
import { Input } from 'chat-list/components/ui/input';
import { getLicenseConfig, setLicenseConfig, setToken } from 'chat-list/local/local';
// import userApi from '@api/user'
import userApi from '@api/user';
import { UserContext } from 'chat-list/store/userContext';
import { useTranslation } from 'react-i18next';
import useChatState from 'chat-list/hook/useChatState';
import { buildChatMessage } from 'chat-list/utils';

interface ICardLicenseProps {
    licenseKey?: string;
}

export default function CardLicense(props: ICardLicenseProps = { licenseKey: '' }) {

    const { user, setUserState, loading: authLoading, updatePoints } = useContext(UserContext);
    const { appendMsg } = useChatState();
    const [licenseKey, setLicenseKey] = useState(props.licenseKey);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { t } = useTranslation('base');

    const onConfirm = async () => {
        try {
            setError('');
            if (!licenseKey) {
                setError(t('Please enter your Access Key'));
                return;
            }
            const token = await userApi.login(licenseKey);
            // console.log(token)
            setToken(token);
            await setLicenseConfig(licenseKey || '');
            setUserState({
                isAuthenticated: true
            });
            appendMsg(buildChatMessage('Set Access Key successfully!', 'text', 'assistant'));
        } catch (e) {
            setError(e.message);
        }
    };

    const onClear = async () => {
        setToken('');
        setLicenseKey('');
        await setLicenseConfig('');
        appendMsg(buildChatMessage('Clear Access Key successfully!', 'text', 'assistant'));

    };

    const onValueChange = (e: any) => {
        setLicenseKey(e.target.value);
    };

    return (
        <Card className="w-full">
            <CardTitle>{t('common.license.title')}</CardTitle>
            <CardContent className="">
                {
                    loading && (
                        <div className='flex flex-row justify-center'>
                            <Loader2 className="ml-1 rotate" width={16} height={16} />
                        </div>
                    )
                }
                {
                    !loading && (
                        <div className="p-1">
                            <Input placeholder={t('common.license.input_placeholder')} value={licenseKey} onChange={onValueChange} />
                            {
                                error && (
                                    <p className='p-1 text-red-500'>
                                        {error}
                                    </p>
                                )
                            }

                        </div>
                    )
                }

                <p className="px-1" dangerouslySetInnerHTML={{
                    __html: t('common.license.desc')
                }}>
                </p>

            </CardContent>
            <CardActions className='p-1 flex flex-row space-x-1'>
                <Button action="create" variant="default" onClick={onConfirm}>
                    {t('common.confirm')}
                </Button>
                <Button action="create" variant='secondary' onClick={onClear}>
                    {t('common.clear', 'Clear')}
                </Button>
            </CardActions>
        </Card>
    );
}
