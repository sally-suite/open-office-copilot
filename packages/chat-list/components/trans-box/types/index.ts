export interface IChatBoxProps {
    selectedText?: string;
    selectedRange?: Range;
    className?: string;
    onClose: () => void;
}