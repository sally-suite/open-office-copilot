import React, { useContext, useEffect, useState } from 'react';
import Modal from 'chat-list/components/modal';
import Tooltip from '../tooltip';
import { Loader2 } from 'lucide-react';
import { Input } from 'chat-list/components/ui/input';
import { getLicenseConfig, getToken, setLicenseConfig, setToken } from 'chat-list/local/local';
// import userApi from '@api/user'
import userApi from '@api/user';
import { UserContext } from 'chat-list/store/userContext';
import { useTranslation } from 'react-i18next';
import useChatState from 'chat-list/hook/useChatState';
import docApi from '@api/email';
import Button from '../button';
import PriceCard from '../price-card';
import Loading from '../loading';

const memStore = {
    init: false
};

export default function LicenseSetting() {
    const { user, setUserState, loading: authLoading, checkLicense, openLogin: open, setOpenLogin: setOpen, signOut } = useContext(UserContext);
    useChatState();
    // const [open, setOpen] = useState(false);
    const [licenseKey, setLicenseKey] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { t } = useTranslation('base');
    const onOpen = async () => {
        setOpen(true);
        await loadKey();
    };
    const onConfirm = async () => {
        try {
            setError('');
            await checkLicense(licenseKey);
            setOpen(false);
        } catch (e) {
            setError(e.message);
        }
    };

    const loadKey = async () => {
        setLoading(true);
        const LicenseKey = await getLicenseConfig();
        setLicenseKey(LicenseKey);
        setLoading(false);
    };

    const onValueChange = (e: any) => {
        setLicenseKey(e.target.value);
    };
    const signInBy = async (platfrom: 'azure-ad' | 'google') => {
        const host = window.location.hostname;
        setOpen(false);
        docApi.openDialog(`https://${host}/auth/add-on/callback/target?platform=${platfrom}`, {}, async (message) => {
            const res = JSON.parse(message);
            const licenseKey = res.key;
            await checkLicense(licenseKey);
            setOpen(false);
        });
    };

    const showSignIn = () => {
        setOpen(true);
    };

    const onSignOut = async () => {
        await signOut();
    }

    const checkKey = async () => {
        const token = await getToken();
        if (!token) {
            setOpen(true);
            if (memStore.init) {
                return;
            }
            memStore.init = true;
            // appendMsg(buildChatMessage(<CardLicense />, 'card', 'assistant'))
        }
    };


    useEffect(() => {
        if (!authLoading) {
            checkKey();
        }
    }, [authLoading]);

    if (authLoading) {
        return (
            <Loading className='h-6 w-6' />
        );
    }

    if (user?.isAuthenticated) {
        return (
            <PriceCard onSignOut={onSignOut} />
        );
    }


    return (
        <>
            <Tooltip tip={t('common.login')}>
                <div className='block text-xs rounded-full border px-2 cursor-pointer whitespace-nowrap' onClick={showSignIn}>
                    {t('common.login')}
                </div>
            </Tooltip>
            <Modal title={t('common.login')} open={open}
                showConfirm={false}
                showClose={false}
                confirmText={t('common.confirm')}
                onClose={() => {
                    setOpen(false);
                }}
            >
                {
                    loading && (
                        <div className='flex flex-row justify-center'>
                            <Loader2 className="ml-1 rotate" width={16} height={16} />
                        </div>
                    )
                }
                <div className="grid gap-4 py-4 px-2">
                    <Button
                        variant={"outline"}
                        disabled={loading}
                        className="mb-1rounded-sm sm:w-full"
                        onClick={signInBy.bind(null, 'google')}
                    >
                        <img
                            className=' h-6 w-6'
                            src="https://www.sally.bot/image/google-48.png"
                            alt="google"
                        />
                        <span className="ml-5 w-32">{t('common.login_with_google')}</span>
                    </Button>
                    <Button
                        variant={"outline"}
                        disabled={loading}
                        className=" rounded-sm sm:w-full"
                        onClick={signInBy.bind(null, 'azure-ad')}
                    >
                        <img
                            className=' h-6 w-6'
                            src="https://www.sally.bot/image/microsoft-48.png"
                            alt="microsoft"
                        />
                        <span className="ml-5  w-32">{t('common.login_with_microsoft')}</span>
                    </Button>
                </div>

                <hr />
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
                <div>
                    <Button
                        variant={"outline"}
                        disabled={loading}
                        className=" rounded-sm sm:w-full"
                        onClick={onConfirm}
                    >
                        <span>{t('common.login_with_license_key')}</span>
                    </Button>
                </div>
                <p className="px-1 text-sm" dangerouslySetInnerHTML={{
                    __html: t('common.license.desc')
                }}>
                </p>
            </Modal>
        </>
    );
}
