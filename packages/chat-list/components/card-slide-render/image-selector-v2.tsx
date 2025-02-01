import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "chat-list/components/ui/sheet";
import { cn } from 'chat-list/lib/utils';
import { ChevronLeft, Crop as CropIcon, Replace } from 'lucide-react';
import { debounce, proxyImage } from 'chat-list/utils';
import Image from './image';
import IconButton from '../icon-button';
import ImageCropper from './image-cropper';

interface ImageSelectorProps {
    title?: string;
    open: boolean;
    onClose: () => void;
    images: { title: string, images: string[] }[];
    onSelect: (img: string) => void
    aspect?: number
}

export default function ImageSelector(props: ImageSelectorProps) {
    const { title, open, onClose, images, onSelect, aspect } = props;
    const [type, setType] = useState<'list' | 'corp'>('list');
    const [currentImage, setCurrentImage] = useState('');
    const [side, setSide] = useState<'bottom' | 'right'>('bottom');
    const imageListRef = useRef<HTMLDivElement>(null);
    const { t } = useTranslation();

    const handleReplace = async (img: string) => {
        const imgBase64 = await proxyImage(img);
        onSelect?.(imgBase64);
    };

    const handleSelectImage = (img: string) => {
        setCurrentImage(img);
        setType('corp');
    };

    const handleCropComplete = (croppedImage: string) => {
        onSelect?.(croppedImage);
        onClose?.();
    };

    const handleBack = () => {
        setType('list');
        setCurrentImage('');
    };

    useEffect(() => {
        if (open) {
            setType('list');
        }
    }, [open]);

    useEffect(() => {
        if (!open || !title) {
            return;
        }
        setTimeout(() => {
            const titleElement = imageListRef.current.querySelector(`#${title}`);
            if (titleElement) {
                titleElement.scrollIntoView({ behavior: 'auto' });
            }
        }, 300);
    }, [open, title]);

    const resizePanel = () => {
        if (window.innerWidth > 500) {
            setSide('right');
        } else {
            setSide('bottom');
        }
    };

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
        <Sheet open={open} onOpenChange={(open: boolean) => {
            if (!open) {
                onClose?.();
            }
        }}>
            <SheetContent side={side} className='flex flex-col bg-opacity-0 p-2'>
                <SheetHeader>
                    <SheetTitle className='flex flex-row items-center'>
                        {
                            type == 'list' && title
                        }
                        {
                            type == 'corp' && (
                                <>
                                    <ChevronLeft onClick={handleBack} className='mr-2 cursor-pointer' />
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
                                'flex flex-col overflow-auto',
                                side == 'right' ? 'h-full' : 'h-[350px]'
                            )}
                            ref={imageListRef}
                        >
                            {
                                images?.map((item, i) => {
                                    return (
                                        <div key={i} className='flex flex-col' >
                                            <h3 id={item.title} className='text-base font-bold sticky top-0 z-10 bg-white py-1'>
                                                {item.title}
                                            </h3>
                                            <div className='grid grid-cols-1 xs:grid-cols-2 gap-2 '>
                                                {
                                                    item.images.map((image, index) => {
                                                        return (
                                                            <div key={index} className=' relative group'>
                                                                <Image alt='' src={image}
                                                                    className='w-full object-contain rounded-[4px]  hover:shadow-md scale-[98%] hover:scale-100 transition-all duration-300'
                                                                />
                                                                <div className='flex flex-row items-center text-sm opacity-0 group-hover:opacity-90 absolute left-1/2 top-1/2  translate-y-[-50%] translate-x-[-50%]'>
                                                                    <IconButton icon={Replace} className='ml-1 w-auto sm:w-auto px-1 h-6' onClick={() => handleReplace(image)} >
                                                                        {t('common.replace')}
                                                                    </IconButton>
                                                                    <IconButton icon={CropIcon} className='ml-1 w-auto sm:w-auto px-1 h-6' onClick={() => handleSelectImage(image)}>
                                                                        {t('common.crop')}
                                                                    </IconButton>
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                }
                                            </div>
                                        </div>
                                    );
                                })
                            }
                        </div>
                    )
                }
                {
                    type == 'corp' && (
                        <ImageCropper
                            image={currentImage}
                            aspect={aspect}
                            side={side}
                            onConfirm={handleCropComplete}
                        />
                    )
                }
            </SheetContent>
        </Sheet>
    );
}
