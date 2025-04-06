
export interface IIconButtonProps {
    className?: string;
    children?: React.ReactNode;
    onActive: (params?: any, e: Event) => void;
}

export interface IPluginComponentProps {
    params?: any;
    selectedText?: string;
    selectedRange?: SelectedRange;
    className?: string;
    onClose?: () => void;
    pin?: boolean;
    onPin?: (pin: boolean) => void;
    position?: { top: number, left: number };
    onPositionChange?: (position: { top: number, left: number }) => void;
}
export interface IPagePlugin {
    id: string;
    name: string;
    icon: any;
    button?: React.FC<IIconButtonProps>;
    shortcut?: string;
    component?: React.FC<IPluginComponentProps>;
    // 窗口宽度
    width?: number;
    hideTip?: boolean;
    mode: 'dialog' | 'dropdown' | 'inline'
}

export type SelectedRange = Range | { element: HTMLElement, start: number, end: number }