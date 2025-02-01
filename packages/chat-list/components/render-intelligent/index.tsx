import React, { } from 'react';
import { ApplyPromptByRowForm } from 'chat-list/components/card-prompt-by-row';
export default function IntelligentRender() {
    return (
        <div className="flex flex-col p-2 h-full">
            <ApplyPromptByRowForm requirements='' column='' />
        </div >
    );
}
