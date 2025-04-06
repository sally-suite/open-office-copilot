import React, { useState } from 'react';
import Header from 'chat-list/components/header';
import { useNavigate } from 'react-router-dom';
import PromptList from 'chat-list/components/prompt-manage';
import { useTranslation } from 'react-i18next';

export default function SearchPaper(props: { hideBack?: boolean }) {
    const { hideBack } = props;
    const [displayBack, setDisplayBack] = useState(!hideBack);
    const { t } = useTranslation(['base']);

    const navigate = useNavigate();

    const onBack = () => {
        // navigate to back
        navigate(-1);
    };

    return (
        <div className='flex flex-col w-full h-screen'>
            <Header title={t('common.prompt_manage')} onBack={displayBack ? onBack : null} />
            <PromptList />
        </div>
    );
}
