import React, { useState } from 'react';
import { Button } from "chat-list/components/ui/button";

export const ThemeColors = [
    {
        name: 'Professional',
        primary: '#4472C4',
        background: '#E6EEF9',
        text: '#1A1A1A',
        highlight: '#7AA1DE',
        complementary: '#C47244'
    },
    {
        name: 'Professional',
        primary: '#5B9BD5',
        background: '#EAF3FB',
        text: '#1A1A1A',
        highlight: '#8CBAE5',
        complementary: '#D5915B'
    },
    {
        name: 'Creative',
        primary: '#ED7D31',
        background: '#FDF1E9',
        text: '#1A1A1A',
        highlight: '#F2A676',
        complementary: '#31A1ED'
    },
    {
        name: 'Contemporary',
        primary: '#FFC000',
        background: '#FFF9E6',
        text: '#1A1A1A',
        highlight: '#FFD54F',
        complementary: '#0080FF'
    },
    {
        name: 'Minimalist',
        primary: '#70AD47',
        background: '#EFF6EA',
        text: '#1A1A1A',
        highlight: '#97C77E',
        complementary: '#AD4770'
    },
    {
        name: 'Classic',
        primary: '#7030A0',
        background: '#F0E6F5',
        text: '#1A1A1A',
        highlight: '#9A5BC0',
        complementary: '#A07030'
    },
    {
        name: 'Sleek',
        primary: '#404040',
        background: '#E9E9E9',
        text: '#1A1A1A',
        highlight: '#737373',
        complementary: '#BFBFBF'
    },
    {
        name: 'Minimalist',
        primary: '#BFBFBF',
        background: '#F8F8F8',
        text: '#1A1A1A',
        highlight: '#D9D9D9',
        complementary: '#404040'
    },
];

interface ThemeSelectorProps {
    // Add props here if needed
    onChange: (theme: typeof ThemeColors[0]) => void
}

export default function ThemeSelector(props: ThemeSelectorProps) {
    const { onChange } = props;
    const [selectedColor, setSelectedColor] = useState(ThemeColors[0]);
    const [showComplementary, setShowComplementary] = useState(false);
    const onSelect = (theme: typeof ThemeColors[0]) => {
        setSelectedColor(theme);
        onChange?.(theme);
    };
    return (
        <div className="p-2 bg-white ">
            <h2 className="font-bold mb-4 text-gray-800">Theme Colors</h2>
            <div className="w-full whitespace-nowrap rounded-md ">
                <div className="flex flex-wrap gap-2">
                    {ThemeColors.map((theme, i) => (
                        <div
                            key={i}
                            className={` py-2 w-8 h-8 rounded cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-105 ${selectedColor.name === theme.name ? 'ring-2 ring-offset-2 ring-blue-300' : ''
                                }`}
                            style={{ backgroundColor: theme.primary }}
                            onClick={() => onSelect(theme)}
                        >
                            {theme.name}
                        </div>
                    ))}
                </div>
            </div>
            {/* <div className="mt-6 p-4 bg-gray-100 rounded-md">
                <h3 className="text-lg font-semibold mb-2">Selected Color: {selectedColor.name}</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <p className="text-sm font-medium">Main Color</p>
                        <div className="flex items-center mt-1">
                            <div className="w-6 h-6 rounded mr-2" style={{ backgroundColor: selectedColor.primary }}></div>
                            <span className="text-sm">{selectedColor.primary}</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-medium">Background Color</p>
                        <div className="flex items-center mt-1">
                            <div className="w-6 h-6 rounded mr-2" style={{ backgroundColor: selectedColor.background }}></div>
                            <span className="text-sm">{selectedColor.background}</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-medium">Text Color</p>
                        <div className="flex items-center mt-1">
                            <div className="w-6 h-6 rounded mr-2" style={{ backgroundColor: selectedColor.text }}></div>
                            <span className="text-sm">{selectedColor.text}</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-medium">
                            {showComplementary ? "Complementary Color" : "Highlight Color"}
                        </p>
                        <div className="flex items-center mt-1">
                            <div
                                className="w-6 h-6 rounded mr-2"
                                style={{ backgroundColor: showComplementary ? selectedColor.complementary : selectedColor.highlight }}
                            ></div>
                            <span className="text-sm">
                                {showComplementary ? selectedColor.complementary : selectedColor.highlight}
                            </span>
                        </div>
                    </div>
                </div>
                <Button
                    onClick={() => setShowComplementary(!showComplementary)}
                    className="w-full"
                >
                    Toggle Highlight/Complementary Color
                </Button>
            </div>
            <div className="mt-4 p-4 rounded-md" style={{ backgroundColor: selectedColor.background }}>
                <h4 className="text-lg font-semibold mb-2" style={{ color: selectedColor.primary }}>
                    Color Combination Example
                </h4>
                <p style={{ color: selectedColor.text }}>
                    This is an example of how the selected colors work together. The
                    <span
                        className="px-1 mx-1 rounded"
                        style={{
                            backgroundColor: showComplementary ? selectedColor.complementary : selectedColor.highlight,
                            color: selectedColor.background
                        }}
                    >
                        highlighted text
                    </span>
                    uses either the highlight or complementary color.
                </p>
            </div> */}
        </div>
    );
}