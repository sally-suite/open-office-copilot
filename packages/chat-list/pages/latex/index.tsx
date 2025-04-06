import React, { useState } from 'react';
import Header from 'chat-list/components/header';
import { useNavigate } from 'react-router-dom';
import CardLatexToWord from 'chat-list/components/card-latex-to-word'
import { useTranslation } from 'react-i18next';

export default function Latex(props: { hideBack?: boolean }) {
    const { hideBack } = props;
    const [displayBack, setDisplayBack] = useState(!hideBack);
    const { t } = useTranslation(['paper']);

    const navigate = useNavigate();

    const onBack = () => {
        // navigate to back
        navigate(-1);
    };

    return (
        <div className='flex flex-col w-full h-screen'>
            <Header title={t('latex_to_word')} onBack={displayBack ? onBack : null} />
            <CardLatexToWord />
        </div>
    );
}
