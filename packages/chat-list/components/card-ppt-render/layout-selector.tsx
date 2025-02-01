import React from 'react';
import { Layout, Image } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

export default function LayoutSelector() {
    return (
        <div className='flex items-center justify-center gap-2'>
            {/* <Image className='w-6 h-6 cursor-pointer text-gray-500' /> */}
            <Popover>
                <PopoverTrigger>
                    <Layout className='w-6 h-6 cursor-pointer text-gray-500' />
                </PopoverTrigger>
                <PopoverContent>
                    测试
                </PopoverContent>
            </Popover>
        </div>
    );
}
