import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Slider } from '../ui/slider';
import Button from '../button';
import { cropImage, proxyImage } from 'chat-list/utils';
import { cn } from 'chat-list/lib/utils';

interface ImageCropperProps {
    image: string;
    aspect?: number;
    side?: 'bottom' | 'right';
    onConfirm: (croppedImage: string) => void;
}

function centerAspectCrop(
    mediaWidth: number,
    mediaHeight: number,
    aspect: number,
) {
    return centerCrop(
        makeAspectCrop(
            {
                unit: '%',
                width: 90,
            },
            aspect,
            mediaWidth,
            mediaHeight,
        ),
        mediaWidth,
        mediaHeight,
    );
}

export default function ImageCropper(props: ImageCropperProps) {
    const { image, aspect, side = 'bottom', onConfirm } = props;
    const { t } = useTranslation();
    const imgRef = useRef<HTMLImageElement>(null);

    const [crop, setCrop] = useState<Crop>({
        x: 5,
        y: 5,
        width: 60,
        height: aspect ? (60 / aspect) : 90,
        unit: '%'
    });
    const [scale, setScale] = useState(1);
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();

    function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
        if (aspect) {
            const { width, height } = e.currentTarget;
            setCrop(centerAspectCrop(width, height, aspect));
        }
    }

    const handleConfirm = async () => {
        const currentImage = imgRef.current;
        const naturalWidth = currentImage.naturalWidth;
        const naturalHeight = currentImage.naturalHeight;
        const imgBase64 = await proxyImage(image);
        const { x, y, height, width } = crop;

        // 计算缩放前的中心点（百分比）
        const centerX = x + width / 2;
        const centerY = y + height / 2;

        // 计算缩放后的裁剪区域（百分比）
        const scaledWidth = width / scale;
        const scaledHeight = height / scale;
        const scaledX = centerX - scaledWidth / 2;
        const scaledY = centerY - scaledHeight / 2;

        // 将百分比转换为像素
        const cropX = (scaledX * naturalWidth) / 100;
        const cropY = (scaledY * naturalHeight) / 100;
        const cropWidth = (scaledWidth * naturalWidth) / 100;
        const cropHeight = (scaledHeight * naturalHeight) / 100;

        const result = await cropImage(imgBase64, cropWidth, cropHeight, cropX, cropY);
        onConfirm?.(result);
    };

    return (
        <div
            className={cn(
                'flex flex-col space-y-2 p-2 overflow-auto',
                side == 'right' ? 'h-auto' : 'max-h-[450px]'
            )}
        >
            <div className='w-full relative'>
                <ReactCrop
                    crop={crop}
                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                    minHeight={50}
                    minWidth={100}
                    onComplete={(c) => setCompletedCrop(c)}
                >
                    <img
                        ref={imgRef}
                        src={image}
                        style={{
                            transform: `scale(${scale})`,
                            transformOrigin: 'center center'
                        }}
                        onLoad={onImageLoad}
                    />
                </ReactCrop>
            </div>

            <div>
                <Slider
                    defaultValue={[scale]}
                    min={0.5}
                    max={3}
                    step={0.1}
                    className="w-full"
                    onValueChange={(e) => {
                        setScale(e[0]);
                    }}
                />
            </div>
            <div className='flex flex-row items-center justify-between'>
                <Button onClick={handleConfirm}>
                    {t('common.confirm')}
                </Button>
            </div>
        </div>
    );
}