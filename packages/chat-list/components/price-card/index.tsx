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

export default function PriceCard() {
    const { t } = useTranslation('base');
    const { user, loading: userInfoLoading, points } = useUserState();
    function renderPoint(realPoints: number) {
        // const points = realPoints > 0 ? realPoints : 5000 + realPoints;
        if (realPoints < 0) {
            return 0;
        }
        return realPoints;
    }
    if (userInfoLoading || !user.isAuthenticated) {
        return null;
    }
    if (user.type == 1 && versions[user.version]) {
        return (
            <a href='https://www.sally.bot/profile' target='_blank' rel="noreferrer" className='text-xs rounded-full border py-[2px] px-2 cursor-pointer'>
                {user.version.toUpperCase()}
            </a>
        );
    }

    return (
        <HoverCard >
            <HoverCardTrigger asChild>
                <a href='https://www.sally.bot/profile' target='_blank' className={cn('block text-xs rounded-full border px-2 cursor-pointer', points <= 1000 ? 'border-red-500' : 'border-primary')} rel="noreferrer">
                    {formatNumber(renderPoint(points))}
                </a>
            </HoverCardTrigger>
            <HoverCardContent className="w-auto p-2 text-sm">
                {
                    points >= 1000 && (
                        <p className='text-sm'>
                            {
                                t('common.remaining_calls', 'Remaining:{num} credits', { 'num': formatNumberWithCommas(points) })
                            }
                        </p>
                    )
                }
                {
                    points < 1000 && (
                        <>
                            <div className='flex flex-col space-y-2 text-sm text-center'>
                                <a className='link' target='_blank' rel="noreferrer" href="https://www.sally.bot/pricing" >
                                    {
                                        t('common.plans_pricing', 'Plans & Pricing')
                                    }
                                </a>
                                <a className='link' target='_blank' rel="noreferrer" href="https://www.sally.bot/earn-free-trial" >
                                    {
                                        t('common.earn_free_trial', 'Earn Free Trial')
                                    }
                                </a>
                            </div>
                        </>
                    )
                }
            </HoverCardContent>
        </HoverCard>
    );
}
