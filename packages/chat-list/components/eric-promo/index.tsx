import React, { useState } from 'react';
import { useEffect } from 'react';
import useUserState from 'chat-list/hook/useUserState';
// import useLocalStore from 'chat-list/hook/useLocalStore';
import Modal from "chat-list/components/modal";
import { useNavigate } from 'react-router-dom';
import useChatState from 'chat-list/hook/useChatState';

export default function EricPromote() {
    const { resetList, messages, plugin, plugins } = useChatState();

    const { points, user, loading } = useUserState();
    const navigate = useNavigate();
    const [isPromoteAlert, setIsPromoteAlert] = useState(false);
    // const { value: isPromoteAlert, setValue: setIsPromoteAlert, } = useLocalStore<boolean>('sally-promote-alert', false);
    const [showAlert, setShowAlert] = useState(false);
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
    const contact = () => {
        setIsPromoteAlert(false);
        setAgent('eric');
    };
    useEffect(() => {

        if (loading) {
            return;
        }
        if (!user.isAuthenticated) {
            return;
        }
        if (user.version !== 'trial') {
            return;
        }
        if (isPromoteAlert) {
            return;
        }
        if (points <= 0 && Date.now() > user.exp) {
            setShowAlert(true);
        }

    }, [loading, points, user, isPromoteAlert]);

    if (loading) {
        return null;
    }
    if (!user.isAuthenticated) {
        return null;
    }

    if (showAlert) {
        return (
            <Modal
                closeText=""
                confirmText='Chat with Eric'
                showClose={false}
                showConfirm={false}
                title={"Version Expired"}
                open={showAlert}
                onClose={() => {
                    // setShowAlert(false);
                    // setIsPromoteAlert(true);
                }}
            >
                <div className='markdown text-base '>
                    <p>
                        Dear {user.username},
                    </p>
                    <p>
                        Your current version has expired.
                    </p>
                    <p>
                        You can upgrade or get an extra 7-day trial:
                    </p>
                    <ul>
                        <li>
                            <a target='_blank' rel="noreferrer" href="https://www.sally.bot/pricing">Upgrade now at a special discount</a>
                        </li>
                        <li>
                            <a target='_blank' rel="noreferrer" href="https://www.sally.bot/earn-free-trial">Share your review and email me to get an extra 7-day trial.</a>
                        </li>
                    </ul>
                    <p>
                        Thank you for being part of Sally AI!🙏 We look forward to serving you better.😊
                    </p>
                    <p>
                        Get in touch with us anytime:
                    </p>
                    <ul>
                        <li>Whatsapp: <a target='_blank' rel="noreferrer" href="https://wa.me/8619066504137">https://wa.me/8619066504137</a></li>
                        <li>Discord: <a target='_blank' rel="noreferrer" href="https://discord.gg/txPgpZmv36">https://discord.gg/txPgpZmv36</a></li>
                        <li>Email: <a target='_blank' rel="noreferrer" href="mailto:sally-suite@hotmail.com">sally-suite@hotmail.com</a></li>
                    </ul>
                </div>
            </Modal >
        );
    }
    return null;
}