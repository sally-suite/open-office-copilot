import React, { useEffect, useState } from 'react'
import themes from 'chat-list/data/slides/theme.json'
import fontConfig from 'chat-list/data/slides/font.json';
// import colorConfig from './data/theme.json';
import Tooltip from 'chat-list/components/tooltip'
import { useTranslation } from 'react-i18next';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "chat-list/components/ui/sheet"
import useChatState from 'chat-list/hook/useChatState';
import { cn } from 'chat-list/lib/utils';
import Cropper from 'react-easy-crop'
import Button from '../button';
import { ChevronDown, ChevronLeft } from 'lucide-react';
import { Slider } from '../ui/slider';
import { cropImage, proxyImage } from 'chat-list/utils';



interface ImageSelectorProps {
    title?: string;
    open: boolean;
    onClose: () => void;
    images: { title: string, images: string[] }[];
    onSelect: (img: string) => void
    aspect: number
}

export default function ThemeSelector(props: ImageSelectorProps) {
    const { title, open, onClose, images, onSelect, aspect } = props;
    const { docType, platform } = useChatState();
    const [type, setType] = useState<'list' | 'corp'>('list');
    const [currentImage, setCurrentImage] = useState('');
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(0.5);
    const [tarImage, setTarImage] = useState('')
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const { t } = useTranslation();
    const onCropComplete = async (croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }
    const onSelectImage = (img: string) => {
        setCurrentImage(img);
        setType('corp');
    }
    const onConfirm = async () => {
        const imgBase64 = await proxyImage(currentImage);
        const { x, y, height, width } = croppedAreaPixels;
        const result = await cropImage(imgBase64, width, height, x, y);
        onSelect?.(result)

    }
    const onBack = () => {
        setType('list')
        setCurrentImage('')
    }
    useEffect(() => {
        if (open) {
            setType('list')
        }
    }, [open])
    return (
        <Sheet open={open} onOpenChange={(open: boolean) => {
            if (!open) {
                onClose?.();
            }
        }}>
            {/* <SheetTrigger>Open</SheetTrigger> */}
            <SheetContent side={docType == 'chat' ? 'right' : 'bottom'} className='flex flex-col bg-opacity-0 p-2'>
                <SheetHeader>
                    <SheetTitle className='flex flex-row items-center'>
                        {
                            type == 'list' && title
                        }
                        {
                            type == 'corp' && (
                                <>
                                    <ChevronLeft onClick={onBack} className='mr-2 cursor-pointer' />
                                    {t('common.crop')}
                                </>
                            )
                        }
                    </SheetTitle>
                </SheetHeader>
                {
                    type == 'list' && (
                        <div
                            className={cn(
                                'flex flex-1 flex-col space-y-2 p-2 overflow-auto',
                                docType == 'chat' ? 'h-full' : 'h-[300px]'
                            )}

                        >
                            {
                                images?.map((item, i) => {
                                    return (
                                        <div key={i} className='flex flex-col' >
                                            <h3 className='text-base font-bold'>
                                                {item.title}
                                            </h3>
                                            <div className='grid grid-cols-2 gap-2'>
                                                {
                                                    item.images.map((image, index) => {
                                                        return (
                                                            <img key={index} src={image} className='w-full object-contain rounded-[4px] cursor-pointer' onClick={onSelectImage.bind(null, image)} />
                                                        )
                                                    })
                                                }
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    )
                }
                {
                    type == 'corp' && (
                        <div
                            className={cn(
                                'flex flex-1 flex-col space-y-2 p-2 overflow-auto',
                                docType == 'chat' ? 'h-full' : 'h-[300px]'
                            )}

                        >

                            <div className='w-full h-[300px] relative'>
                                <Cropper
                                    image={currentImage}
                                    crop={crop}
                                    zoom={zoom}
                                    aspect={aspect || 1}
                                    onCropChange={setCrop}
                                    onCropComplete={onCropComplete}
                                    onZoomChange={setZoom}
                                    restrictPosition={false}
                                />
                            </div>
                            <div>
                                <img src={tarImage} alt="" />
                            </div>
                            <div>
                                <Slider
                                    defaultValue={[zoom]}
                                    min={0.2}
                                    max={3}
                                    step={0.1}
                                    className={cn("w-full")}
                                    onValueChange={(e) => {
                                        setZoom(e[0])
                                    }}
                                />
                            </div>
                            <div className='flex flex-row items-center justify-between'>
                                <Button onClick={onConfirm}>
                                    {t('common.confirm')}
                                </Button>
                            </div>
                        </div>
                    )
                }

            </SheetContent>
        </Sheet>
    )
}