import React, { useState } from 'react';
import { CircleImageCropper, HeartImageCropper, ShapeImageCropper } from './shape-image-cropper';

// Example of a custom star shape path
const createStarPath = (width: number, height: number) => ({
    draw: (ctx: CanvasRenderingContext2D) => {
        const centerX = width / 2;
        const centerY = height / 2;
        const spikes = 5;
        const outerRadius = Math.min(width, height) / 2;
        const innerRadius = outerRadius / 2;

        ctx.beginPath();
        for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i * Math.PI) / spikes - Math.PI / 2;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
    }
});

export const ShapeCropperDemo: React.FC = () => {
    const [selectedShape, setSelectedShape] = useState<'circle' | 'heart' | 'star'>('circle');
    const [imageUrl, setImageUrl] = useState<string>('');
    const [size, setSize] = useState<number>(300);
    const [previewUrl, setPreviewUrl] = useState<string>('');

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setImageUrl(url);
        }
    };

    return (
        <div className="p-4 space-y-4">
            <div className="space-y-2">
                <label className="block text-sm font-medium">Upload Image:</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="block w-full text-sm"
                />
            </div>

            <div className="space-x-2">
                <button
                    className={`px-4 py-2 rounded ${selectedShape === 'circle' ? 'bg-blue-500 text-white' : 'bg-gray-200'
                        }`}
                    onClick={() => setSelectedShape('circle')}
                >
                    Circle
                </button>
                <button
                    className={`px-4 py-2 rounded ${selectedShape === 'heart' ? 'bg-blue-500 text-white' : 'bg-gray-200'
                        }`}
                    onClick={() => setSelectedShape('heart')}
                >
                    Heart
                </button>
                <button
                    className={`px-4 py-2 rounded ${selectedShape === 'star' ? 'bg-blue-500 text-white' : 'bg-gray-200'
                        }`}
                    onClick={() => setSelectedShape('star')}
                >
                    Star
                </button>
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium">Crop Size: {size}px</label>
                <input
                    type="range"
                    min="100"
                    max="500"
                    value={size}
                    onChange={(e) => setSize(Number(e.target.value))}
                    className="w-full"
                />
            </div>

            {imageUrl && (
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Original Crop</h3>
                        {selectedShape === 'circle' && (
                            <CircleImageCropper
                                src={imageUrl}
                                size={size}
                                onCrop={setPreviewUrl}
                            />
                        )}
                        {selectedShape === 'heart' && (
                            <HeartImageCropper
                                src={imageUrl}
                                width={size}
                                height={size}
                                onCrop={setPreviewUrl}
                            />
                        )}
                        {selectedShape === 'star' && (
                            <ShapeImageCropper
                                src={imageUrl}
                                width={size}
                                height={size}
                                shape="custom"
                                customPath={createStarPath(size, size)}
                                onCrop={setPreviewUrl}
                            />
                        )}
                    </div>

                    {previewUrl && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Preview</h3>
                            <img
                                src={previewUrl}
                                alt="Cropped preview"
                                className="max-w-full h-auto"
                            />
                            <a
                                href={previewUrl}
                                download="cropped-image.png"
                                className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                Download
                            </a>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
