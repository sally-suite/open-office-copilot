import React, { } from 'react';
import {
    Card,
    CardContent,
    CardTitle,
    CardActions,
    // RadioGroup,
} from "chat-list/components/ui/card";
import Button from '../button';
import { IChatMessage } from 'chat-list/types/message';

export interface ICardMuteProps {
    message: IChatMessage;
    onContinue: () => void;
}

export default function CardMute(props: ICardMuteProps) {
    const { message, onContinue } = props;
    return (
        <Card className="w-card">
            <CardTitle>Mute Message</CardTitle>
            <CardContent className=" markdown">
                <p>
                    {`I received the message: ${message.content}`}
                </p>
                <p>
                    {`If you'd like to continue, please lift the mute, and then click on Unmute and Continue. Thank you.`}
                </p>
            </CardContent>
            <CardActions>
                <Button
                    action="translate-text"
                    color="primary"
                    onClick={onContinue}
                >
                    Umute and Continue
                </Button>
            </CardActions>
        </Card >
    );
}
