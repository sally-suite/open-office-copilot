import React from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from 'chat-list/components/ui/sheet'

interface IActionSheetProps {
    title?: string;
    description?: string;
    children?: React.ReactNode;
    open: boolean;
    onClose?: () => void;
}

export default function index(props: IActionSheetProps) {
    const { title, open, description, children, onClose } = props;
    const onOpenChange = (open: boolean) => {
        if (!open) {
            onClose?.();
        }
    }
    return (
        <Sheet open={open} onOpenChange={onOpenChange} modal={false}>
            {/* <SheetTrigger></SheetTrigger> */}
            <SheetContent side="bottom" className="p-0 pt-8">
                {
                    title && (
                        <SheetHeader>
                            <SheetTitle>{title}</SheetTitle>
                            <SheetDescription>
                                {description}
                            </SheetDescription>
                        </SheetHeader>
                    )
                }
                {children}
            </SheetContent>
        </Sheet>

    )
}
