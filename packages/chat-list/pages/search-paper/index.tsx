import { getLocalStore } from 'chat-list/local/local'
import React, { useState } from 'react'
import CardPapers from 'chat-list/components/card-papers'
import Header from 'chat-list/components/header';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function SearchPaper(props: { hideBack?: boolean }) {
    const papers = getLocalStore('paper-list') || [];
    const { hideBack } = props;
    const [displayBack, setDisplayBack] = useState(!hideBack)
    const navigate = useNavigate();
    const { t } = useTranslation();

    const onBack = () => {
        // navigate to back
        navigate(-1);
    }

    return (
        <div className='flex flex-col w-full h-screen'>
            <Header title={t('paper:search_papers')} onBack={displayBack ? onBack : null} />
            <CardPapers papers={papers} />
        </div>
    )
}
