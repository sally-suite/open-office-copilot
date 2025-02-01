import { Presentation, TextCursorInput } from 'lucide-react'
import React from 'react'

interface IContextTextProps {
    type: 'selected_text' | 'selected_slides',
    text: string,
    slides: any[]
}

export default function ContextText(props: IContextTextProps) {
    const { text, slides } = props
    return (
        <div className='flex flex-row items-center h-6 w-full px-2 text-sm bg-[#f0f1f5] border-b justify-start  rounded-tl-sm '>

            {
                text && (
                    <div className='flex-1 flex flex-row items-center overflow-hidden'>
                        <TextCursorInput height={14} width={14} className='text-gray-500' />
                        <div className='flex-1 ml-1 text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis'>
                            {text}
                        </div>
                        <span className='text-gray-500'>
                            [{text.length}]
                        </span>
                    </div>
                )
            }
            {
                !text && slides && slides.length > 0 && (
                    <div className='flex-1 flex flex-row items-center mr-1 overflow-hidden'>
                        <Presentation height={14} width={14} className='text-gray-500' />
                        <span className='flex-1 ml-1 text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis'>
                            [ {slides.map(p => p.num).join(', ')} ]
                        </span>
                    </div>
                )
            }
        </div>
    )
}
