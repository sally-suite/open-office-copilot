import React from 'react';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "chat-list/components/ui/dialog"
import Button from '../button';

interface IModalProps {
    open: boolean;
    title: string;
    description?: string;
    showClose?: boolean;
    onClose?: () => void;
    onConfirm?: () => void;
    closeText?: string;
    confirmText?: string;
    showConfirm?: boolean;
    children?: React.ReactNode;
}

export default function index(props: IModalProps) {
    const { open, title, description, children,
        showClose = true,
        closeText = 'Close',
        showConfirm = true,
        confirmText = 'Confirm',
        onClose,
        onConfirm
    } = props;
    const onOpenChange = (open: boolean) => {
        if (!open) {
            onClose?.();
        }
    }
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {/* <DialogTrigger>{title}</DialogTrigger> */}
            <DialogContent className="p-4 w-4/5 md:w-1/2  rounded-md">
                {
                    title && (
                        <DialogHeader>
                            <DialogTitle >{title}</DialogTitle>
                            {
                                description && (
                                    <DialogDescription>
                                        {description}
                                    </DialogDescription>
                                )
                            }

                        </DialogHeader>
                    )
                }
                {children}
                <DialogFooter>
                    {
                        showClose && (
                            <DialogClose asChild>
                                <Button type="button" action='close' className='my-1' >
                                    {closeText}
                                </Button>
                            </DialogClose>
                        )
                    }
                    {
                        showConfirm && (
                            <Button type="button" action='confirm' onClick={onConfirm} className='my-1'>
                                {confirmText}
                            </Button>
                        )
                    }
                </DialogFooter>
            </DialogContent>
        </Dialog>

    )
}
