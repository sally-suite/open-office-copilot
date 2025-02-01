import React, { useContext, useEffect, useState } from 'react'
import Modal from 'chat-list/components/modal'
import Tooltip from '../tooltip';
import { Loader2 } from 'lucide-react';
import { Input } from 'chat-list/components/ui/input';
import { getLicenseConfig, getToken } from 'chat-list/local/local';
// import userApi from '@api/user'
import { UserContext } from 'chat-list/store/userContext';
import { useTranslation } from 'react-i18next'
import Button from '../button';

const memStore = {
    init: false
}

export default function LicenseSetting() {
    const { loading: authLoading, checkLicense, openLogin: open, setOpenLogin: setOpen } = useContext(UserContext);
    // const [open, setOpen] = useState(false);
    const [licenseKey, setLicenseKey] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { t } = useTranslation('base');
    const onConfirm = async () => {
        try {
            setError('')
            await checkLicense(licenseKey);
            setOpen(false);
        } catch (e) {
            setError(e.message);
        }

    }

    const loadKey = async () => {
        setLoading(true);
        const LicenseKey = await getLicenseConfig();
        setLicenseKey(LicenseKey);
        setLoading(false);
    }

    const onValueChange = (e: any) => {
        setLicenseKey(e.target.value);
    }

    const showSignIn = () => {
        setOpen(true);
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
    }

    useEffect(() => {
        if (!authLoading) {
            checkKey();
        }
    }, [authLoading])
    return (
        <>
            <Tooltip tip={t('common.login')}>
                {/* <KeyRound name='openai' className="ml-1" width={16} height={16} onClick={showSignIn} /> */}
                <div className='block text-xs mr-2 rounded-full border px-2 cursor-pointer whitespace-nowrap' onClick={showSignIn}>
                    {t('common.login')}
                </div>
            </Tooltip>
            <Modal title={t('common.login')} open={open}
                showConfirm={false}
                showClose={false}
                onConfirm={onConfirm}
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
                        className=" rounded-sm"
                        onClick={onConfirm}
                    >
                        <span className="ml-5">{t('common.login_with_license_key')}</span>
                    </Button>
                </div>
                <p className="px-1 text-sm" dangerouslySetInnerHTML={{
                    __html: t('common.license.desc')
                }}>
                </p>
            </Modal>
        </>
    )
}
