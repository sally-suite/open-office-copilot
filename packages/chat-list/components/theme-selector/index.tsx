import React, { useEffect, useState } from 'react';
import { Sun, Moon, Check, Type } from 'lucide-react';
import { Card, CardContent } from "chat-list/components/ui/card";
import { ScrollArea } from "chat-list/components/ui/scroll-area";
import lightThemes from './theme-light.json'
import darkThemes from './theme-dark.json'
import { Sheet, SheetContent, SheetHeader } from '../ui/sheet';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { cn } from 'chat-list/lib/utils';
import fontList from './fonts.json';
import { debounce } from 'chat-list/utils';

interface Theme {
    name: string;
    primary: string;
    highlight: string;
    title: string;
    body: string;
    background: string;
    pageBackground: string;
}

interface Font {
    name: string;
    code: string;
    title: string;
    body: string;
    web: {
        title: string;
        body: string;
    };
    headingClass: string;
    bodyClass: string;
}

interface ThemePreviewCardProps {
    theme: Theme;
    font: Font;
    active: boolean;
    onSelect: () => void;
    sample: {
        title: string;
        body: string;
    }
}

interface FontPreviewCardProps {
    theme: Theme;
    font: Font;
    active: boolean;
    onSelect: () => void;
    sample: {
        title: string;
        body: string;
    }
}

const ThemePreviewCard: React.FC<ThemePreviewCardProps> = ({ theme, font, sample, active, onSelect }) => {
    return (
        <Card
            className={`relative cursor-pointer hover:shadow-md overflow-hidden transition-all ${active ? 'ring-2 ring-primary' : ''}`}
            onClick={onSelect}
        >
            <CardContent className="p-4" style={{ backgroundColor: theme.pageBackground }}>
                <div className="flex items-center justify-between mb-1" >
                    {/* <span className="font-medium">{theme.name}</span> */}
                    {active && (
                        <span className="absolute top-2 right-2">
                            <Check className="w-4 h-4 text-primary" />
                        </span>
                    )}
                </div>

                {/* Theme Preview Card */}
                <div
                    className="rounded-lg overflow-hidden"
                    style={{ backgroundColor: theme.background, fontFamily: font.web.title }}
                >
                    <div className="p-3 space-y-3">
                        {/* Title */}
                        <div
                            className="text-base font-semibold whitespace-nowrap overflow-hidden text-ellipsis"
                            style={{ color: theme.title }}
                        >
                            {sample.title || 'Title'}
                        </div>

                        {/* Content */}
                        <div className="space-y-2">
                            <div
                                className="p-2 rounded "
                                style={{
                                    color: theme.body,
                                    backgroundColor: theme.highlight,
                                    fontFamily: font.web.body
                                }}
                            >
                                <span className='text-xs block whitespace-nowrap overflow-hidden text-ellipsis'>
                                    {sample.body || 'Body'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Color Swatches */}
                <div className="mt-3 flex justify-between items-center">
                    <div className="flex gap-2">
                        <div
                            className="w-4 h-4 rounded-full border border-gray-200"
                            style={{ backgroundColor: theme.primary }}
                            title="Primary"
                        />
                        <div
                            className="w-4 h-4 rounded-full border border-gray-200"
                            style={{ backgroundColor: theme.highlight }}
                            title="Highlight"
                        />
                        <div
                            className="w-4 h-4 rounded-full border border-gray-200"
                            style={{ backgroundColor: theme.pageBackground }}
                            title="Page Background"
                        />
                    </div>
                    <div
                        className="text-xs opacity-60"
                        style={{ color: theme.body }}
                    >
                        Preview
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

const FontPreviewCard: React.FC<FontPreviewCardProps> = ({ theme, sample, active, font, onSelect }) => {
    return (
        <Card
            className={`relative cursor-pointer hover:shadow-md overflow-hidden transition-all ${active ? 'ring-2 ring-primary' : ''}`}
            onClick={onSelect}
        >
            <CardContent className="p-4" style={{ backgroundColor: theme.pageBackground }}>
                <div className="flex items-center justify-between mb-1" >
                    <span
                        className="font-medium whitespace-nowrap overflow-hidden text-ellipsis"
                        style={{
                            color: theme.title,
                        }}
                    >
                        {font.name}
                    </span>
                    {active && (
                        <span className="absolute top-2 right-2">
                            <Check className="w-4 h-4 text-primary" />
                        </span>
                    )}
                </div>

                {/* Theme Preview Card */}
                <div
                    className="rounded-lg overflow-hidden"
                    style={{ backgroundColor: theme.background }}
                >
                    <div className="p-3 space-y-3">
                        {/* Title */}
                        <div
                            className="text-base font-semibold whitespace-nowrap overflow-hidden text-ellipsis"
                            style={{ color: theme.title, fontFamily: font.web.title }}
                        >
                            {sample.title || 'Title'}
                        </div>

                        {/* Content */}
                        <div className="space-y-2">
                            <div
                                className="p-2 rounded "
                                style={{
                                    color: theme.body,
                                    backgroundColor: theme.highlight,
                                    fontFamily: font.web.body
                                }}
                            >
                                <span className='text-sm block whitespace-nowrap overflow-hidden text-ellipsis'>
                                    {sample.body || 'Body'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

interface IThemePanelProps {
    open: boolean;
    onClose: () => void;
    onChange: (theme: Theme, font: Font) => void;
    theme?: Theme,
    font?: Font;
    sample?: {
        title: string;
        body: string;
    }
}

const ThemePanel: React.FC<IThemePanelProps> = (props: IThemePanelProps) => {
    const { theme, font, open, onClose, onChange, sample } = props;
    const [fonts] = useState(fontList)
    const [mode, setMode] = useState<'light' | 'dark' | 'font'>('light');
    const [selectedTheme, setSelectedTheme] = useState<Theme>(theme || lightThemes[0]);
    const [selectedFont, setSelectedFont] = useState<Font>(font || fonts[0]);
    const [side, setSide] = useState<'bottom' | 'right'>('bottom')
    const themes = mode === 'light' ? lightThemes : darkThemes;
    const onSelectedTheme = (theme: Theme) => {
        // const theme = themes.find((theme) => theme.name === themeName);
        setSelectedTheme(theme);
        if (theme) {
            onChange(theme, selectedFont);
        }
    }
    const onSelectedFont = (font: Font) => {
        // const font = fonts.find((font) => font.name === fontName);
        setSelectedFont(font);
        if (font) {
            onChange(selectedTheme, font);
        }
    }
    const resizePanel = () => {
        // 判断屏幕宽度
        if (window.innerWidth > 500) {
            setSide('right');
        } else {
            setSide('bottom');
        }
    }
    useEffect(() => {
        const handleResize = () => {
            resizePanel();
        };

        const debounceResize = debounce(handleResize, 300);

        window.addEventListener('resize', debounceResize);

        resizePanel();

        return () => {
            window.removeEventListener('resize', debounceResize);
        };
    }, []);

    return (
        <Sheet
            open={open}
            onOpenChange={(open: boolean) => {
                if (!open) {
                    onClose();
                }
            }}>
            {/* <SheetTrigger>Open</SheetTrigger> */}
            <SheetContent side={side} className='flex flex-col bg-opacity-0 p-2'>
                <SheetHeader>
                    {/* <SheetTitle className='flex flex-row items-center '>
                        <span>
                            {t('common.theme')}
                        </span>
                    </SheetTitle> */}
                </SheetHeader>
                <div
                    className={cn(
                        'flex flex-col overflow-auto',
                        side == 'right' ? 'h-full' : 'h-[380px]'
                    )}
                >
                    <Tabs
                        defaultValue="light"
                        value={mode}
                        className="w-full px-5 py-2"
                        onValueChange={(value: "light" | "dark") => setMode(value)}
                    >
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="light">
                                <Sun className="w-4 h-4 shrink-0" />
                                Light
                            </TabsTrigger>
                            <TabsTrigger value="dark" >
                                <Moon className="w-4 h-4 shrink-0" />
                                Dark
                            </TabsTrigger>
                            <TabsTrigger value="font" >
                                <Type className="w-4 h-4 shrink-0" />
                                Font
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>

                    {
                        (mode == 'light' || mode == 'dark') && (
                            <ScrollArea className="flex-1 overflow-auto pr-4">
                                <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 p-2">
                                    {themes.map((theme) => (
                                        <ThemePreviewCard
                                            key={theme.name}
                                            sample={sample}
                                            theme={theme}
                                            font={selectedFont}
                                            active={selectedTheme.name === theme.name}
                                            onSelect={() => onSelectedTheme(theme)}
                                        />
                                    ))}
                                </div>
                            </ScrollArea>
                        )
                    }
                    {
                        mode == 'font' && (
                            <ScrollArea className="flex-1 overflow-auto pr-4">
                                <div className="grid grid-cols-1 gap-2 p-2">
                                    {fonts.map((font) => (
                                        <FontPreviewCard
                                            key={font.name}
                                            sample={sample}
                                            font={font}
                                            theme={selectedTheme}
                                            active={selectedFont.name === font.name}
                                            onSelect={() => onSelectedFont(font)}
                                        />
                                    ))}
                                </div>
                            </ScrollArea>
                        )
                    }

                </div>
            </SheetContent>
        </Sheet>
    );
};

export default ThemePanel;