import React, { useContext, useState } from 'react';
import Modal from 'chat-list/components/modal';
import { Loader2 } from 'lucide-react';
// import userApi from '@api/user'
import { UserContext } from 'chat-list/store/userContext';
import { useTranslation } from 'react-i18next';
import docApi from '@api/doc';
import Button from '../button';
import Loading from '../loading';
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger } from '../ui/dropdown-menu';

const memStore = {
    init: false
};

export default function LicenseSetting({ className = '' }: { className?: string }) {
    const { loading: authLoading, user, checkLicense, openLogin: open, setOpenLogin: setOpen, signOut } = useContext(UserContext);
    // const [open, setOpen] = useState(false);
    const [licenseKey, setLicenseKey] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { t } = useTranslation('base');
    const onConfirm = async () => {
        try {
            setError('');
            await checkLicense(licenseKey);
            setOpen(false);
        } catch (e) {
            setError(e.message);
        }

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

    // const checkKey = async () => {
    //     const token = await getToken();
    //     if (!token) {
    //         // setOpen(true);
    //         if (memStore.init) {
    //             return;
    //         }
    //         memStore.init = true;
    //         // appendMsg(buildChatMessage(<CardLicense />, 'card', 'assistant'))
    //     }
    // };


    // useEffect(() => {
    //     if (!authLoading) {
    //         checkKey();
    //     }
    // }, [authLoading]);


    if (authLoading) {
        return (
            <Loading className='h-6 w-6' />
        );
    }

    return (
        <>
            {/* <Tooltip tip={t('common.login')}>
                <div className={cn('block text-xs rounded-full border px-2 cursor-pointer whitespace-nowrap', className)} onClick={showSignIn}>
                    {
                        user.state == 'anonymous' && t('common.offline')
                    }
                    {
                        user.state != 'anonymous' && t('common.online')
                    }
                </div>
            </Tooltip> */}
            <DropdownMenu >
                <DropdownMenuTrigger asChild >
                    <div className='text-xs rounded-full border py-[2px] px-2 cursor-pointer'>
                        {
                            user.state == 'anonymous' && t('common.offline')
                        }
                        {
                            user.state != 'anonymous' && t('common.online')
                        }
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center">
                    {
                        user.state != 'anonymous' && (
                            <DropdownMenuLabel className=' cursor-pointer' onClick={signOut} >
                                {
                                    t('common.sign_out', 'Sign out')
                                }
                            </DropdownMenuLabel>
                        )
                    }
                    {
                        user.state == 'anonymous' && (
                            <DropdownMenuLabel className=' cursor-pointer' >
                                <div
                                    className='flex flex-row items-center space-x-1'
                                    onClick={signInBy.bind(null, 'azure-ad')}
                                >
                                    <img
                                        className=' h-6 w-6'
                                        src="/image/microsoft-48.png"
                                        alt="microsoft"
                                    />
                                    <span className="w-32 whitespace-nowrap font-normal">{t('common.login_with_microsoft')}</span>
                                </div>
                            </DropdownMenuLabel>
                        )
                    }
                </DropdownMenuContent>
            </DropdownMenu>
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
                    {/* <Button
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
                    </Button> */}
                    <div className='flex flex-row items-center justify-center pb-4'>
                        <img
                            className=' h-12 w-12'
                            src="/image/microsoft-48.png"
                            alt="microsoft"
                        />
                    </div>
                    <Button
                        variant={"outline"}
                        disabled={loading}
                        className=" rounded-sm sm:w-full"
                        onClick={signInBy.bind(null, 'azure-ad')}
                    >
                        <span className="w-32">{t('common.login_with_microsoft')}</span>
                    </Button>
                </div>


            </Modal>
        </>
    );
}
