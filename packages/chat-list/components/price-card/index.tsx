import useUserState from 'chat-list/hook/useUserState';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "chat-list/components/ui/hover-card";
import { cn } from 'chat-list/lib/utils';
import { formatNumber, formatNumberWithCommas } from 'chat-list/utils';
import useChatState from 'chat-list/hook/useChatState';
// import { PointConfig } from 'chat-list/config/price';

const versions: any = {
    "basic": "Basic",
    "standard": "Standard",
    "pro": "Pro",
    "trial": "Trial",
    "word": "Word",
    "powerpoint": "Powerpoint",
    "excel": "Excel",
    "chrome": "Chrome",
    "outook": "Outook",
    "flex": "Flex"
};

export default function PriceCard({ onSignOut }: { onSignOut: () => void }) {
    const { t } = useTranslation('base');
    const { user, loading: userInfoLoading, points, checkUserState, } = useUserState();
    const { platform } = useChatState();
    function renderPoint(realPoints: number) {
        // const points = realPoints > 0 ? realPoints : 5000 + realPoints;
        if (realPoints < 0) {
            return 0;
        }
        return realPoints;
    }
    const refresh = () => {
        checkUserState();
    }
    const signOut = () => {
        onSignOut();
    }
    if (userInfoLoading || !user.isAuthenticated) {
        return null;
    }
    if (user.state == 'anonymous') {
        return (
            <HoverCard >
                <HoverCardTrigger asChild>
                    <div className='text-xs rounded-full border py-[2px] px-2 cursor-pointer'>
                        {t('common.login')}
                    </div>
                </HoverCardTrigger>
                <HoverCardContent className="w-auto p-2 text-sm">
                    <div className='flex flex-col space-y-2 text-sm text-center'>
                        {
                            (platform === 'office' || platform == 'chrome' || process.env.NODE_ENV === "development") && (
                                <div className='link cursor-pointer' onClick={signOut} >
                                    {
                                        t('common.login')
                                    }
                                </div>
                            )
                        }
                    </div>
                </HoverCardContent>
            </HoverCard>
        );
    }

    return (
        <HoverCard >
            <HoverCardTrigger asChild>
                <div className={cn('block text-xs rounded-full border px-2 cursor-pointer', points <= 1000 ? 'border-red-500' : 'border-primary')} >
                    {formatNumber(renderPoint(points))}
                </div>
            </HoverCardTrigger>
            <HoverCardContent className="w-auto p-2 text-sm">
                <div className='flex flex-col space-y-2 text-sm text-center'>
                    {
                        (platform === 'office' || platform == 'chrome' || process.env.NODE_ENV === "development") && (
                            <div className='link cursor-pointer' onClick={signOut} >
                                {
                                    t('common.sign_out', 'Sign out')
                                }
                            </div>
                        )
                    }
                </div>
            </HoverCardContent>
        </HoverCard>
    );
}
