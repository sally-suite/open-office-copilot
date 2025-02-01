import React, { useEffect, useRef } from 'react';
import promote from './promote.md';
import { chatByTemplate } from 'chat-list/service/message';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import { buildChatMessage } from 'chat-list/utils';
import useUserState from 'chat-list/hook/useUserState';
import useChatState from 'chat-list/hook/useChatState';
import { useNavigate } from 'react-router-dom';
import useLocalStore from 'chat-list/hook/useLocalStore';
import alert from './alert.md';

export default function EricPromote() {
    const { appendMsg, showMessage, resetList, messages, plugin, plugins } = useChatState();
    const { points, user } = useUserState();
    const { value: isPromoteAlert, setValue: setIsPromoteAlert } = useLocalStore('sally-promote-alert', false);
    const { value: isPointAlert, setValue: setIsPointAlert } = useLocalStore('user-point-alert', false);
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    const setAgent = (agent: string) => {
        const plg = plugins.find((p) => p.action === agent);
        if (plugin) {
            (plugin as any)['messages'] = messages;
        }
        const msgs = (plg as any)['messages'];
        if (msgs) {
            resetList(msgs);
        } else {
            resetList([]);
        }
        navigate(`/${agent}`);
    };
    // 
    const showPromo = () => {
        // appendMsg(promote);
        const msg = showMessage('', 'assistant');
        chatByTemplate(promote, {
            "user_name": user.username,
            language: i18n.resolvedLanguage || 'en-US'
        }, { stream: true }, (done, result) => {
            msg.update(result.content);
            if (done) {
                const msg = buildChatMessage((
                    (
                        <div className='flex flex-col items-start space-y-2'>
                            <Button size='sm' variant='secondary' onClick={() => {
                                window.open('https://www.sally.bot/pricing', '_blank');
                            }}>
                                {t('common.plans_pricing', 'Plans & Pricing')}
                            </Button>
                            <Button size='sm' variant='secondary' onClick={() => {
                                window.open('https://www.sally.bot/earn-free-trial', '_blank');
                            }}>
                                {t('common.earn_free_trial', 'Earn Free Trial')}
                            </Button>
                            <Button size='sm' variant='secondary' onClick={() => {
                                setAgent(`eric`);
                            }}>
                                {t('common.technical_support', 'Feedback')}
                            </Button>
                        </div>
                    )
                ), 'card');
                appendMsg(msg);
            }
        });
    };
    const showAlert = () => {
        const msg = showMessage('', 'assistant');
        chatByTemplate(alert, {
            "user_name": user.username,
            language: i18n.resolvedLanguage || 'en-US'
        }, { stream: true }, (done, result) => {
            msg.update(result.content);
            if (done) {
                const msg = buildChatMessage((
                    (
                        <div className='flex flex-col items-start space-y-2'>
                            <Button size='sm' variant='secondary' onClick={() => {
                                window.open('https://www.sally.bot/pricing', '_blank');
                            }}>
                                {t('common.plans_pricing', 'Plans & Pricing')}
                            </Button>
                            <Button size='sm' variant='secondary' onClick={() => {
                                window.open('https://www.sally.bot/earn-free-trial', '_blank');
                            }}>
                                {t('common.earn_free_trial', 'Earn Free Trial')}
                            </Button>
                            <Button size='sm' variant='secondary' onClick={() => {
                                setAgent(`eric`);
                            }}>
                                {t('common.technical_support', 'Feedback')}
                            </Button>
                        </div>
                    )
                ), 'card');
                appendMsg(msg);
            }
        });
    };
    useEffect(() => {
        if (user.version !== 'free') {
            return;
        }
        if (points < 0 || Date.now() > user.exp) {
            if (!isPromoteAlert) {
                setIsPromoteAlert(true);
                showPromo();
            }
        } else if (points < -4000) {
            if (!isPointAlert) {
                setIsPointAlert(true);
                showAlert();
            }
        } else if (points > 0) {
            setIsPromoteAlert(false);
            setIsPointAlert(false);
        }
    }, [points, user?.version]);

    return <></>;
}
