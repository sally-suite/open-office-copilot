
import React, { } from 'react'
import { Grid3X3 } from 'lucide-react';


export default function ContextSheet({ address = '' }: { address?: string }) {

    return (
        <div className='flex flex-row items-center h-6 min-w-20 w-full px-2 text-sm bg-[#f0f1f5] border-b justify-start rounded-tl-sm '>
            <Grid3X3 height={16} width={16} className='mr-1 text-gray-500' />
            <span className='text-gray-500'>
                {address}
            </span>
        </div >
    )
}
