import React, { useState } from 'react';
import {
    Card,
    CardContent,
    // RadioGroup,
} from "chat-list/components/ui/card";
import { useTranslation } from 'react-i18next'
import useChatState from 'chat-list/hook/useChatState';
import Markdown from '../markdown';

export default function CardContext() {
    const { t } = useTranslation(['sheet']);
    const [display, setDisplay] = useState(false)
    const { dataContext } = useChatState();
    const toggleDisplay = () => {
        setDisplay(!display)
    }
    return (
        <Card className="w-full">
            <CardContent className=" flex flex-row flex-wrap justify-center">
                <div className='w-full'>
                    {
                        display && (
                            <Markdown>
                                {dataContext}
                            </Markdown>
                        )
                    }
                    <div className=' text-center' onClick={toggleDisplay}>
                        {
                            display ? "Hide Context" : "Show Context"
                        }
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
