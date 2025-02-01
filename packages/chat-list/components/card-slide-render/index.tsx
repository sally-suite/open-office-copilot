import React, { useEffect, useRef, useState } from 'react';
import CardPPTRender from 'chat-list/components/card-ppt-render';
import PPTPreview from 'chat-list/components/card-ppt-render/preview';

import Button from 'chat-list/components/button';
import { generatePPT } from 'chat-list/service/slide';
import { getSlideTemplate, ITemplate } from './templates';
// import sample from './data/sample.json';
import { ISlideItem, Metadata, Slide, SlideElement, Theme } from 'chat-list/types/api/slide';
import slideApi from '@api/slide';
import ThemeSelect from 'chat-list/components/theme-selector';
// import { SlideContext, SlideProvider } from './context'
import { useTranslation } from 'react-i18next';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "chat-list/components/ui/sheet";
import { corpImageByRatio, getImgSize } from 'chat-list/utils';
import useChatState from 'chat-list/hook/useChatState';
import { cn } from 'chat-list/lib/utils';
import Loading from '../loading';
import ImageSelector from './image-selector-v2';
import { Download, FileOutput, Palette, Undo2 } from 'lucide-react';
import ChartSelector from './chart-selector';

// const width = 1276.8;
// const height = 720;

interface SlideRenderProps {
    theme?: string;
    slideData: ISlideItem[];
    slideImages: { title: string, images: string[] }[];
    metadata: Metadata;
    status: 'generating' | 'done';
    onRegenerate?: () => void;
}

const SlideRender = (props: SlideRenderProps) => {
    const { slideData: defaultSlideData, metadata, theme: defaultTheme, slideImages = [], status, onRegenerate } = props;// useContext(SlideContext);
    const { docType, platform, setPreview } = useChatState();
    const [slideData, setSlideData] = useState(defaultSlideData);

    const [theme, setTheme] = useState(null);
    const [colors, setColors] = useState<any>({
        "name": "minimalist",
        "primary": "#6f6f6f",
        "background": "#F8F8F8",
        "title": "#030303",
        "body": "#464646",
        "highlight": "#D9D9D9",
        "complementary": "#404040"
    });
    const [pages, setPages] = useState<Slide[]>([]);
    const [temps, setTemps] = useState<ITemplate[]>([]);
    const [tempOptions, setTempOptions] = useState<{ [x: number]: Theme }>({});
    const [fonts, setFonts] = useState({
        "name": "Modern Clean",
        "code": "modern-clean",
        "title": "Segoe UI Light",
        "body": "Segoe UI",
        "web": {
            "title": "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
            "body": "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif"
        },
        "headingClass": "font-light",
        "bodyClass": "font-normal"
    });
    const [slideTemps, setSlideTemps] = useState([]);
    const [openTempWin, setOpenTempWin] = useState(false);
    const [selectedSlide, setSelectedSlide] = useState<ISlideItem>(null);
    const [selectedElement, setSelectedElement] = useState<SlideElement>(null);
    const [selectedSlideIndex, setSelectedSlideIndex] = useState<number>(0);
    const [selectedSlideElementIndex, setSelectedSlideElementIndex] = useState<number>(0);
    const [imageIndex, setImageIndex] = useState(0);
    const [openImageWin, setOpenImageWin] = useState(false);
    const [chartIndex, setChartIndex] = useState(0);
    const [openChartWin, setOpenChartWin] = useState(false);
    const [openThemeSelector, setOpenThemeSelector] = useState(false);
    const [loading, setLoading] = useState(false);
    const slidesRef = useRef(null);
    const isAddImage = !!slideImages.length;
    const { t } = useTranslation();

    const download = async () => {
        if (platform != 'office') {
            const pages = await renderForNative(slideData, colors, fonts);
            await generatePPT({
                slides: pages,
                theme: {
                    colors: colors,
                    fonts: fonts
                },
                metadata: metadata
            });
        } else {
            // const base64 = await generatePPT({
            //     slides: pages,
            //     theme: {
            //         colors: colors,
            //         fonts: fonts
            //     },
            //     metadata: metadata
            // });
            // // base64字符串转File
            // const file = await base64ToFile(base64, metadata.title + '.pptx', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
            // const newBlob = await upload(`office-file/${file.name}`, file, {
            //     access: 'public',
            //     handleUploadUrl: '/api/file/upload',

            // });
            // console.log(newBlob)
            // if (newBlob) {
            //     window.open(newBlob.url, '_blank');
            // }
        }
    };
    const insert = async () => {
        const pages = await renderForNative(slideData, colors, fonts);
        if (platform == 'office') {
            await slideApi.generatePresentation({
                slides: pages,
                theme: {
                    colors: colors,
                    fonts: fonts
                },
                metadata: metadata
            });
        } else if (platform == 'google') {
            for await (const slide of pages) {
                await slideApi.generateSlide([slide]);
            }
        }

    };
    const randomTemp = (type: string,) => {
        const templates = getSlideTemplate(type, isAddImage);

        if (!templates.length) return null;

        const i = (Math.random() * (templates.length - 1)).toFixed(0) as unknown as number;
        const temp = templates[i];
        return temp || templates[0];
        // if (type == 'cover') {
        //     const i = (Math.random() * (covers.length - 1)).toFixed(0) as unknown as number;
        //     temp = covers[i];
        // } else if (type === 'overview') {
        //     temp = overviews[i];
        // } else if (type === 'catalog') {
        //     temp = catalogs[i];
        // } else if (type === 'end') {
        //     temp = ends[i];
        // } else if (type == 'section') {
        //     temp = catalogs[i];
        // } else {
        //     temp = slides[i];
        // }
        // return temp;
    };

    const onSelectSlide = async (slide: Slide, index: number) => {
        const selectedSlide = slideData[index];
        setSelectedSlide(selectedSlide);
        setSelectedSlideIndex(index);
        setLoading(true);
        setOpenTempWin(true);
        const ts = getSlideTemplate(selectedSlide.type, isAddImage);
        const pages = await Promise.all(ts.map(async (temp: any, i: number) => {
            try {
                const render = temp.render;
                if (temp.image && temp.imageRatio) {
                    const img = selectedSlide.image[0];
                    const imgRatio = temp.imageRatio;
                    // 按imgRatio比例裁剪img
                    const tarImage = await corpImageByRatio(img.src, imgRatio, null, 'cover');
                    selectedSlide.image[0].src = tarImage;
                }
                const result = await render(selectedSlide, {
                    colors: colors,
                    fonts: fonts.web
                });
                return result;
            } catch (error) {
                return null;
            }
        }));
        const slideTemps = pages.filter(p => !!p);
        setSlideTemps(slideTemps);
        setOpenTempWin(true);
        setLoading(false);

        // setPreview({
        //     title: selectedSlide.title,
        //     component: (
        //         <PPTPreview
        //             key={selectedSlide.title}
        //             onSelectSlide={onSelectSlideTemp.bind(null, selectedSlide, index)}
        //             slides={slideTemps}
        //         />
        //     )
        // })
    };
    const onSelectElement = (element: SlideElement, slideIndex: number, elementIndex: number) => {
        // if (openImageWin) {
        //     setOpenImageWin(false);
        //     return;
        // }

        // console.log(element, slideIndex, elementIndex)
        if (element.type == 'image') {
            const selectedSlide = slideData[slideIndex];
            setSelectedSlide(selectedSlide);
            setSelectedElement(element);
            setSelectedSlideIndex(slideIndex);
            setSelectedSlideElementIndex(elementIndex);
            const imgIndex = pages[slideIndex].elements.filter(p => p.type == 'image').findIndex(p => p.src == element.src);
            setImageIndex(imgIndex);

            setOpenImageWin(true);
        } else if (element.type == 'chart') {
            const selectedSlide = slideData[slideIndex];
            console.log(selectedSlide);
            setSelectedSlide(selectedSlide);
            setSelectedElement(element);
            setSelectedSlideIndex(slideIndex);
            setSelectedSlideElementIndex(elementIndex);
            const chartIndex = pages[slideIndex].elements.filter(p => p.type == 'chart').findIndex(p => p === element);
            setChartIndex(chartIndex);
            setOpenChartWin(true);
        }


    };
    const onInsertSlide = async (slide: Slide, index: number) => {
        // console.log(slide)
        const page = await renderForSingle(index, colors, fonts);
        if (platform == 'office') {
            await slideApi.generatePresentation({
                slides: [page],
                theme: {
                    colors: colors,
                    fonts: fonts
                },
                metadata: metadata
            });
        } else if (platform == 'google') {
            await slideApi.generateSlide([page]);
        }
    };
    const onChangeTemplate = (slide: any, index: number) => {

        onSelectSlide(slide, index);
    };
    const onSelectImage = async (image: string,) => {
        let tarImage = slideData[selectedSlideIndex].image[imageIndex];
        if (!tarImage) {
            slideData[selectedSlideIndex].image[imageIndex] = { src: image, width: 'auto', height: 'auto' };
            tarImage = slideData[selectedSlideIndex].image[imageIndex];
        };
        tarImage.src = 'loading';
        setSlideData([...slideData]);
        // setOpenImageWin(false);

        // await generate();
        // const imgBase64 = await proxyImage(image);
        renderSlide(slideData, temps, colors, fonts);
        setTimeout(async () => {
            const img = await getImgSize(image);
            tarImage.width = img.width;
            tarImage.height = img.height;
            tarImage.src = image;
            setSlideData([...slideData]);
            renderSlide(slideData, temps, colors, fonts);
            setOpenImageWin(false);
        }, 100);


    };

    const onSelectChart = async (chartType: string) => {
        const tarChart = slideData[selectedSlideIndex].data[chartIndex];
        tarChart.chart_type = chartType;
        setSlideData([...slideData]);
        renderSlide(slideData, temps, colors, fonts);
        setOpenChartWin(false);
    };

    const onThemeSelect = (theme: any, font: any) => {
        // console.log(theme, font)
        setTheme(theme);
        setColors(theme);
        setFonts(font);
        renderSlide(slideData, temps, theme, font);
    };
    const onSelectSlideTemp = (slide: any, index: number) => {
        // console.log(selectedSlide, selectedSlideIndex, slide, index)
        setOpenTempWin(false);

        const ts = getSlideTemplate(selectedSlide.type, isAddImage);
        temps[selectedSlideIndex] = ts[index];
        setTemps([...temps]);
        renderSlide(slideData, temps, colors, fonts);
    };
    const renderSlide = async (slideData: ISlideItem[], temps: ITemplate[], colors: any, fonts: any) => {
        const pages = await Promise.all(temps.map(async (temp: any, index: number) => {
            try {
                const option = tempOptions[index] || {};
                const render = temp.render;
                const result = await render(slideData[index], {
                    colors: colors,
                    fonts: fonts.web,
                    ...option
                });
                return result;
            } catch (error) {
                return null;
            }
        }));
        setPages(pages.filter(p => !!p));
    };

    const renderForNative = async (slideData: any[], colors: any, fonts: any) => {
        const pages = await Promise.all(temps.map(async (temp: any, index: number) => {
            try {
                const option = tempOptions[index] || {};
                const render = temp.render;
                const result = await render(slideData[index], {
                    colors: colors,
                    fonts: fonts,
                    ...option
                });
                return result;
            } catch (error) {
                return null;
            }
        }));
        return pages;
    };
    const renderForSingle = async (index: number, colors: any, fonts: any) => {
        const temp = temps[index];
        const data = slideData[index];
        const option = tempOptions[index] || {};
        const render = temp.render;
        const result = await render(data, {
            colors: colors,
            fonts: fonts,
            ...option
        });
        return result;
    };

    const init = async (slideData: ISlideItem[]) => {
        const templates = slideData.map((item, index) => {
            if (index < temps.length) {
                return temps[index];
            }
            return randomTemp(item.type);
        });
        // console.log(templates)
        const newTemps = templates.filter(p => !!p);
        const pages = await Promise.all(newTemps.map(async (temp: any, index: number) => {
            try {
                const option = tempOptions[index] || {};
                const render = temp.render;
                if (temp.image && temp.imageRatio) {
                    const img = slideData[index].image[0];
                    const imgRatio = temp.imageRatio;
                    // 按imgRatio比例裁剪img
                    const tarImage = await corpImageByRatio(img.src, imgRatio, null, 'cover');
                    slideData[index].image[0].src = tarImage;
                }
                const result = await render(slideData[index], {
                    colors: colors,
                    fonts: fonts.web,
                    ...option
                });
                return result;
            } catch (error) {
                return null;
            }
        }));
        setTemps(newTemps);
        setPages(pages.filter(p => !!p));
    };

    useEffect(() => {
        init(defaultSlideData);
    }, [defaultSlideData]);

    useEffect(() => {
        setSlideData(defaultSlideData);
        setTimeout(() => {
            slidesRef.current.scrollTop = slidesRef.current.scrollHeight;
        }, 1000);
    }, [defaultSlideData]);

    return (
        <div className={cn(
            "flex flex-row w-full overflow-auto h-full",
            // docType == 'chat' ? " h-full" : " h-auto"
        )}>
            <div className='flex flex-1 flex-col items-center overflow-hidden'>
                <div className={cn('flex-1 w-full overflow-auto p-2 scroll-smooth',
                    docType != 'chat' && (openThemeSelector || openImageWin) ? " pb-[350px]" : ""
                )}
                    ref={slidesRef}
                >
                    <CardPPTRender
                        onInsert={onInsertSlide}
                        onSelectElement={onSelectElement}
                        onChangeTemplate={onChangeTemplate}
                        slides={pages}
                    />

                    {status === 'generating' && (
                        <div className=' h-20 flex justify-center items-center'>
                            <Loading className='h-8' />
                        </div>
                    )}
                </div>
                {/* <ThemeSelector onChange={onThemeChange} /> */}
                <div className='w-full'>
                    <div className='flex flex-row space-x-1 mt-2 '>
                        {
                            docType == 'slide' && (
                                <Button size='sm' icon={FileOutput} variant='outline' onClick={insert}>
                                    {t('common.insert')}
                                </Button>
                            )
                        }
                        {
                            platform !== 'office' && (
                                <Button size='sm' icon={Download} variant='outline' className='sm:w-auto' onClick={download}>
                                    {t('common.download')}
                                </Button>
                            )
                        }
                        <Button size='sm' icon={Palette} variant='outline' onClick={() => {
                            setOpenThemeSelector(true);
                        }}>
                            {t('common.theme')}
                        </Button>
                        {
                            onRegenerate && (
                                <Button icon={Undo2} variant='secondary' size='sm' onClick={() => {
                                    onRegenerate?.();
                                }} >
                                    {t('common.back')}
                                </Button>
                            )
                        }

                        {/* <Button size='sm' icon={LayoutDashboard} variant='outline' className='sm:w-auto' onClick={randomGenerate}>
                            {t('common.random_layout')}
                        </Button> */}
                    </div>
                </div>
            </div>
            <Sheet open={openTempWin} onOpenChange={(open) => {
                if (!open) {
                    setOpenTempWin(false);
                }
            }}>
                {/* <SheetTrigger>Open</SheetTrigger> */}
                <SheetContent side={docType == 'chat' ? 'right' : 'bottom'} className='bg-opacity-0'>
                    <SheetHeader>
                        <SheetTitle>
                            {selectedSlide?.title}
                        </SheetTitle>
                    </SheetHeader>
                    <div className={cn(
                        'overflow-auto p-2',
                        docType == 'chat' ? 'h-full' : 'h-[300px]'
                    )}>

                        {
                            loading && (
                                <div className='mt-10'>
                                    <Loading className='h-8' />
                                </div>
                            )
                        }
                        {
                            !loading && (
                                <PPTPreview
                                    onSelectSlide={onSelectSlideTemp}
                                    slides={slideTemps}
                                />
                            )
                        }
                    </div>
                </SheetContent>
            </Sheet>

            <ImageSelector
                title={selectedSlide?.title}
                images={slideImages}
                aspect={temps[selectedSlideIndex]?.imageRatio}
                onSelect={onSelectImage}
                open={openImageWin}
                onClose={() => {
                    setOpenImageWin(false);
                }}
            />

            <ThemeSelect
                sample={{
                    title: (selectedSlide || defaultSlideData[0])?.title,
                    body: (selectedSlide || defaultSlideData[0])?.text
                }}
                open={openThemeSelector}
                onClose={() => {
                    setOpenThemeSelector(false);
                }}
                onChange={onThemeSelect}
            />

            <ChartSelector
                title={selectedSlide?.title}
                data={selectedSlide?.data?.[chartIndex]}
                theme={{
                    colors,
                    fonts
                }}
                onSelect={onSelectChart}
                open={openChartWin}
                onClose={() => {
                    setOpenChartWin(false);
                }}
            />

        </div>
    );
};



export default SlideRender;

// export default function SlideRender(props: SlideRenderProps) {
//     const { slideData, slideImages, metadata, theme, } = props;

//     return (
//         <SlideProvider
//             slideData={slideData}
//             slideImages={slideImages}
//             metadata={metadata}
//             theme={theme}
//         >
//             <PPTRender />
//         </SlideProvider>
//     )
// }
