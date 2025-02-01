import React, { useEffect, useRef, useState } from 'react'
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
// import Cropper from 'react-easy-crop'
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop'
import Button from '../button';
import { ChevronDown, ChevronLeft, Crop as CropIcon, FileOutput, Replace } from 'lucide-react';
import { Slider } from '../ui/slider';
import { corpImageByRatio, cropImage, proxyImage } from 'chat-list/utils';
import 'react-image-crop/dist/ReactCrop.css';
import Image from './image';
import IconButton from '../icon-button';

interface ImageSelectorProps {
    title?: string;
    // open: boolean;
    // onClose: () => void;
    images: { title: string, images: string[] }[];
    onSelect: (img: string) => void
    aspect?: number
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
    )
}

export default function ThemeSelector(props: ImageSelectorProps) {
    const { title, open, onClose, images, onSelect, aspect } = props;
    const { docType, platform } = useChatState();
    const [type, setType] = useState<'list' | 'corp'>('list');
    const [currentImage, setCurrentImage] = useState('');
    const [crop, setCrop] = useState<Crop>({
        x: 5,
        y: 5,
        width: 60,
        height: aspect ? (60 / aspect) : 90,
        unit: '%'
    })
    const [tarImage, setTarImage] = useState('')
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
    const [scale, setScale] = useState(1)
    const imgRef = useRef<HTMLImageElement>(null)
    const imageListRef = useRef<HTMLDivElement>(null)
    const { t } = useTranslation();
    const onCropComplete = async (croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }
    const onReplace = async (img: string) => {
        const imgBase64 = await proxyImage(img);
        onSelect?.(imgBase64)
    }
    const onSelectImage = (img: string) => {
        setCurrentImage(img);
        setType('corp');
    }
    function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
        if (aspect) {
            const { width, height } = e.currentTarget
            setCrop(centerAspectCrop(width, height, aspect))
        }
    }
    const onConfirm = async () => {
        const image = imgRef.current;
        const naturalWidth = image.naturalWidth;
        const naturalHeight = image.naturalHeight;
        const imgBase64 = await proxyImage(currentImage);
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
    }, [open]);

    useEffect(() => {
        if (!title) {
            return;
        }

        setType('list')

        setTimeout(() => {
            if (!imageListRef.current) {
                return;
            }
            const titleElement = imageListRef.current.querySelector(`#${title}`);
            // console.log(title, titleElement)
            if (titleElement) {
                titleElement.scrollIntoView({ behavior: 'auto' });
            }
        }, 300)
    }, [title])

    useEffect(() => {
        if (aspect) {
            setCrop({
                unit: '%',
                x: 5,
                y: 5,
                width: 60,
                height: aspect ? (60 / aspect) : 90,
            })
        }
    }, [aspect])
    return (

        <div className='flex w-[200px] flex-col bg-opacity-0 p-2'>
            <div className='flex flex-row items-center'>
                {
                    type == 'list' && t('common.image_list')
                }
                {
                    type == 'corp' && (
                        <>
                            <ChevronLeft onClick={onBack} className='mr-2 cursor-pointer' />
                            {t('common.crop')}
                        </>
                    )
                }
            </div>
            {
                type == 'list' && (
                    <div
                        className={cn(
                            'flex flex-col overflow-auto',
                            docType == 'chat' ? 'h-full' : 'h-[300px]'
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
                                        <div className='grid grid-cols-2 gap-2 '>
                                            {
                                                item.images.map((image, index) => {
                                                    return (
                                                        <div key={index} className=' relative group'>
                                                            <Image alt='' src={image}
                                                                className='w-full object-contain rounded-[4px] cursor-pointer hover:shadow-md scale-[98%] hover:scale-100 transition-all duration-300'
                                                                onClick={onReplace.bind(null, image)}
                                                            />
                                                            <div className='flex flex-row items-center left-1 top-1 absolute text-sm opacity-0 group-hover:opacity-90'>
                                                                <IconButton icon={Replace} className='ml-1 w-auto sm:w-auto px-1 h-6' onClick={onReplace.bind(null, image)} >
                                                                    {t('common.replace')}
                                                                </IconButton>
                                                                <IconButton icon={CropIcon} className='ml-1 w-auto sm:w-auto px-1 h-6' onClick={onSelectImage.bind(null, image)}>
                                                                    {t('common.crop')}
                                                                </IconButton>
                                                            </div>
                                                        </div>
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
                            'flex  flex-col space-y-2 p-2 overflow-auto',
                            docType == 'chat' ? 'h-auto' : 'max-h-[450px]'
                        )}

                    >

                        <div className='w-full relative '>
                            {/* <Cropper
                                    image={currentImage}
                                    crop={crop}
                                    zoom={zoom}
                                    aspect={aspect || 1}
                                    onCropChange={setCrop}
                                    onCropComplete={onCropComplete}
                                    onZoomChange={setZoom}
                                    restrictPosition={false}
                                /> */}
                            <ReactCrop
                                crop={crop}
                                onChange={(_, percentCrop) => setCrop(percentCrop)}
                                // aspect={aspect}
                                minHeight={100}
                                minWidth={100}
                                onComplete={(c) => setCompletedCrop(c)}
                            >
                                <img
                                    ref={imgRef}
                                    src={currentImage}
                                    style={{
                                        transform: `scale(${scale})`,
                                        transformOrigin: 'center center'  // 修改这里
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
                                className={cn("w-full")}
                                onValueChange={(e) => {
                                    setScale(e[0])
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

        </div>
    )
}