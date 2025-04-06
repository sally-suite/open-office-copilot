import React, {
    // useContext,
    useState,
} from 'react';
import ModelSelect from 'chat-list/components/model-select';
import Tooltip from 'chat-list/components/tooltip';
import Modal from 'chat-list/components/modal';
import LanguageSwitch from 'chat-list/components/language-switch';
import { useTranslation } from 'react-i18next';
// import { UserContext } from 'chat-list/store/userContext';
// import Loading from '../loading';
// import LicenseSetting from '../license-setting';

export default function index() {
    const { t } = useTranslation('base');
    // const { user, loading: userInfoLoading } = useContext(UserContext);

    const [alert, setAlert] = useState({
        open: false,
        title: '',
        content: null
    });
    // const haveSetOpenAIKey = getLocalStore(USER_SET_OPENAI_API_KEY);

    const onAlertClose = () => {
        setAlert({ open: false, title: '', content: '' });
    };

    return (
        <div className='flex flex-row px-1 pb-1 justify-between items-center text-gray-500'>
            <div className='flex flex-row items-center'>
                <ModelSelect />
            </div>
            <div className='flex flex-row items-center'>
                {/* {
                    userInfoLoading && (
                        <Loading className='h-6 w-6' />
                    )
                }
                {
                    !userInfoLoading && (
                        <LicenseSetting />
                    )
                } */}
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
