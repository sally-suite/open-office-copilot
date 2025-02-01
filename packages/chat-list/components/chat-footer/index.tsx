import React, {
    useState,
    useContext,
} from 'react';
import { ChatContext } from 'chat-list/store/chatContext';
import { UserContext } from 'chat-list/store/userContext';
import ModelSelect from 'chat-list/components/model-select';
import { GptModel } from 'chat-list/types/chat';
import Tooltip from 'chat-list/components/tooltip';
import Modal from 'chat-list/components/modal';

import LicenseSetting from 'chat-list/components/license-setting';
import LanguageSwitch from 'chat-list/components/language-switch';
import { useTranslation } from 'react-i18next';
import PriceCard from 'chat-list/components/price-card';
import Loading from '../loading';
import { Headphones } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
export default function index() {
    const { t } = useTranslation('base');
    const navigate = useNavigate();
    // const [isAccessoryOpen, setIsAccessoryOpen] = useState(false);
    const { platform, model, setModel, provider, setProvider } = useContext(ChatContext);
    const { user, loading: userInfoLoading } = useContext(UserContext);
    const [alert, setAlert] = useState({
        open: false,
        title: '',
        content: null
    });
    // const haveSetOpenAIKey = getLocalStore(USER_SET_OPENAI_API_KEY);
    const onModelChange = (value: GptModel, provider: string) => {
        // console.log(value)
        setModel(value);
        setProvider(provider);
    };
    const onAlertClose = () => {
        setAlert({ open: false, title: '', content: '' });
    };
    const onFeedback = () => {
        navigate(`/eric`);
    };
    return (
        <div className='flex flex-row px-1 pb-1 justify-between items-center text-gray-500'>
            <div className='flex flex-row items-center'>
                <ModelSelect value={model} provider={provider} onChange={onModelChange} />
            </div>
            <div className='flex flex-row items-center'>
                {
                    userInfoLoading && (
                        <Loading className='h-6 w-6' />
                    )
                }
                {
                    (!userInfoLoading && user.isAuthenticated) ? (
                        <PriceCard />
                    ) : null
                }
                {
                    !userInfoLoading && !user.isAuthenticated && (platform === 'office' || platform == 'chrome' || process.env.NODE_ENV === "development") && (
                        <LicenseSetting />
                    )
                }

                <Tooltip tip={t('common.technical_support', 'Technical Support')}>
                    <div onClick={onFeedback}>
                        <Headphones width={16} height={16} className="ml-2" />
                    </div>
                </Tooltip>
                <Tooltip tip={t('common.change_language', 'Change Language')}>
                    <LanguageSwitch />
                </Tooltip>
            </div>
            <Modal
                open={alert.open}
                title={alert.title}
                onClose={onAlertClose}
                showConfirm={false}
            >
                {alert.content}
            </Modal>
        </div>
    );
}
