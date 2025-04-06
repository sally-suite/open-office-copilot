// EmojiSelector.tsx
import React, { useState, FC } from 'react';
import data from '@emoji-mart/data';
// import 'emoji-mart/css/emoji-mart.css';
import Picker from '@emoji-mart/react';

interface EmojiSelectorProps {
    value: string;
    onChange: (emoji: string) => void;
}

const EmojiSelector: FC<EmojiSelectorProps> = ({ value, onChange }) => {
    const [showPicker, setShowPicker] = useState(false);

    const handleEmojiSelect = (emoji: any) => {
        onChange(emoji.native);
        setShowPicker(false);
    };

    return (
        <div className="relative">
            <div
                onClick={() => setShowPicker(!showPicker)}
                className="px-4 py-1 rounded focus:outline-none cursor-pointer"
            >
                {!value && (
                    <div className='flex flex-col items-center'>
                        Select an Emoji as avatar
                    </div>
                )}
                {value && (
                    <div className='flex flex-col items-center'>
                        <span className=' text-6xl'>{value} </span>
                        {/* <span>Change</span> */}
                    </div>
                )}

            </div>
            {showPicker && (
                <div className="absolute top-12  left-1/2 -translate-x-1/2 z-10">
                    <Picker perLine={7} style={{ with: 200 }} onEmojiSelect={handleEmojiSelect} data={data} />
                </div>
            )}
        </div>
    );
};

export default EmojiSelector;
