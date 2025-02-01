import React, { useRef, useEffect } from 'react';

interface ShapeImageCropperProps {
    src: string;
    width: number;
    height: number;
    shape: 'circle' | 'custom';
    // For custom shapes, provide an array of points or a path function
    customPath?: {
        draw: (ctx: CanvasRenderingContext2D) => void;
    };
    onCrop?: (dataUrl: string) => void;
}

export const ShapeImageCropper: React.FC<ShapeImageCropperProps> = ({
    src,
    width,
    height,
    shape,
    customPath,
    onCrop,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const image = new Image();
        image.src = src;
        image.onload = () => {
            // Clear canvas
            ctx.clearRect(0, 0, width, height);

            // Start a new path
            ctx.beginPath();

            if (shape === 'circle') {
                // Draw circle path
                const centerX = width / 2;
                const centerY = height / 2;
                const radius = Math.min(width, height) / 2;
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            } else if (shape === 'custom' && customPath) {
                // Draw custom path
                customPath.draw(ctx);
            }

            // Create clipping mask
            ctx.clip();

            // Calculate scaling to fit image while maintaining aspect ratio
            const scale = Math.max(
                width / image.width,
                height / image.height
            );

            // Calculate position to center the image
            const x = (width - image.width * scale) / 2;
            const y = (height - image.height * scale) / 2;

            // Draw the image with scaling
            ctx.drawImage(
                image,
                x, y,
                image.width * scale,
                image.height * scale
            );

            // Generate and pass the cropped image data URL
            if (onCrop) {
                const dataUrl = canvas.toDataURL('image/png');
                onCrop(dataUrl);
            }
        };
    }, [src, width, height, shape, customPath, onCrop]);

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            style={{
                maxWidth: '100%',
                height: 'auto'
            }}
        />
    );
};

// Example usage:
export const CircleImageCropper: React.FC<{
    src: string;
    size: number;
    onCrop?: (dataUrl: string) => void;
}> = ({ src, size, onCrop }) => {
    return (
        <ShapeImageCropper
            src={src}
            width={size}
            height={size}
            shape="circle"
            onCrop={onCrop}
        />
    );
};

// Example of custom path cropper (heart shape)
export const HeartImageCropper: React.FC<{
    src: string;
    width: number;
    height: number;
    onCrop?: (dataUrl: string) => void;
}> = ({ src, width, height, onCrop }) => {
    const heartPath = {
        draw: (ctx: CanvasRenderingContext2D) => {
            const topCurveHeight = height * 0.3;
            ctx.moveTo(width / 2, height * 0.2);

            // Left curve
            ctx.bezierCurveTo(
                width / 4, 0,
                0, height / 4,
                width / 2, height
            );

            // Right curve
            ctx.bezierCurveTo(
                width, height / 4,
                width * 0.75, 0,
                width / 2, height * 0.2
            );
        }
    };

    return (
        <ShapeImageCropper
            src={src}
            width={width}
            height={height}
            shape="custom"
            customPath={heartPath}
            onCrop={onCrop}
        />
    );
};
