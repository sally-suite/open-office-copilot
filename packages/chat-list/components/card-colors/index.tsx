import React from 'react';
import {
    Card,
    CardContent,
    CardTitle,
    CardActions,
    // RadioGroup,
} from "chat-list/components/ui/card";
import Button from '../button';

interface ICardConfirmProps {
    title?: string;
    content: string | React.ReactNode;
    okText?: string;
    cancelText?: string;
    hideCancel?: boolean;
    onOk?: () => void;
    onCancel?: () => void;
}


export function CardColor(props: ICardConfirmProps) {
    const { title, content, okText, hideCancel = false, onOk = () => void 0, onCancel = () => void 0 } = props;

    return (
        <Card className=" w-card">
            <CardTitle>{title}</CardTitle>
            <CardContent>
                {content}
            </CardContent>
            <CardActions className='space-x-1'>
                <Button action="create" variant="default" onClick={onOk}>
                    {okText || 'Ok'}
                </Button>
                {
                    !hideCancel && (
                        <Button action="create" variant='secondary' onClick={onCancel}>
                            Cancel
                        </Button>
                    )
                }
            </CardActions>
        </Card>
    );
}

export default React.memo(CardColor);
