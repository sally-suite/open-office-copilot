import React, { useState } from 'react';
import CatalogConfirm, { IStatus } from 'chat-list/components/catalog-confirm';
import LicenseSetting from 'chat-list/components/license-setting';
import pptPng from 'chat-list/assets/img/ppt-80.png'
import { cn } from 'chat-list/lib/utils';
import EricPromo from 'chat-list/components/eric-promo';

export default function RenderSlide() {
    const [status, setStatus] = useState<IStatus>('input');

    return (
        <div className='flex flex-col w-full h-screen overflow-hidden'>
            <div className='flex flex-row items-center justify-start pt-2 px-2'>
                <LicenseSetting className="text-sm rounded-sm" />
            </div>
            <div className={cn(
                'flex flex-col items-center overflow-hidden transition-all duration-500 delay-200',
                status != 'input' ? 'opacity-0 h-0 ' : 'opacity-100 h-[112px]'
            )}>
                <img src={pptPng} alt="" className='w-14 h-14 mt-4' />
                <p className=' font-mono font-semibold mb-4'>
                    Generate Presentation
                </p>
            </div>
            <div className='flex-1 overflow-hidden'>
                <CatalogConfirm className='' onStatusChange={(value) => {
                    setStatus(value)
                }} />
            </div>
            <EricPromo />
        </div>

    )
}
