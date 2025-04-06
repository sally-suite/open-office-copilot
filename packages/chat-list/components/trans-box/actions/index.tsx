import { Check, Copy, RefreshCw, Replace } from 'lucide-react'
import React from 'react'
import Tooltip from 'chat-list/components/tooltip';

const buttons = [
    {
        name: 'Replace',
        icon: Replace
    },
    {
        name: 'Insert',
        icon: Check
    },
    {
        name: 'Copy',
        icon: Copy
    },
    {
        name: 'Regenerate',
        icon: RefreshCw
    }
]

interface IActionProps {
    selection: Selection;
}

export default function Actions(props: IActionProps) {
    return (
        <div className='flex flex-row space-x-1'>
            {buttons.map((button, index) => {
                const Icon = button.icon;
                return (
                    <Tooltip key={button.name} tip={button.name}>
                        <div key={button.name} className='flex flex-row items-center space-x-1'>
                            <Icon height={16} width={16} />
                        </div>
                    </Tooltip>
                )
            })}
        </div>
    )
}
