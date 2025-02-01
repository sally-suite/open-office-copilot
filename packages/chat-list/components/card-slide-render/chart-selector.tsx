import React, { useEffect, useState } from 'react'
// import colorConfig from './data/theme.json';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "chat-list/components/ui/sheet"
import { ChartTypes } from 'chat-list/types/api/slide';
import { generateEChartsOption, renderEChart } from 'chat-list/utils/chart';
import { Theme } from 'chat-list/types/api/slide';
import { debounce } from 'chat-list/utils';
import Loading from '../loading';

interface ChartSelectorProps {
    theme: Theme;
    title?: string;
    open: boolean;
    onClose: () => void;
    data: { name: string, labels: string[], values: number[] };
    onSelect: (chartType: string) => void;
}

export default function ChartSelector(props: ChartSelectorProps) {
    const { title, open, onClose, data, onSelect, theme } = props;
    const [side, setSide] = useState<'bottom' | 'right'>('bottom')
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const onSelectChart = (chartType: string) => {
        onSelect?.(chartType)
    }

    const resizePanel = () => {
        // 判断屏幕宽度
        if (window.innerWidth > 500) {
            setSide('right');
        } else {
            setSide('bottom');
        }
    }

    const init = () => {
        setLoading(true);
        const imgs = ChartTypes?.map((chartType, i) => {
            const config = generateEChartsOption(chartType, [data], {
                title: '',
                titleColor: theme.colors.title,
                labelColor: theme.colors.body,
            });

            const chartImg = renderEChart({
                ...config,
                width: `200px`,
                height: `150px`,
                backgroundColor: theme.colors.highlight,
            });
            return chartImg;
        });
        setImages(imgs);
        setLoading(false);
    }

    useEffect(() => {
        if (!open) {
            return;
        }
        init();
    }, [open])


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
        <Sheet open={open}
            onOpenChange={(open: boolean) => {
                if (!open) {
                    onClose?.();
                }
            }}>
            {/* <SheetTrigger>Open</SheetTrigger> */}
            <SheetContent side={side} className='flex flex-col bg-opacity-0 p-2'>
                <SheetHeader>
                    <SheetTitle className='flex flex-row items-center'>
                        Chart
                    </SheetTitle>
                </SheetHeader>
                {
                    loading && (
                        <div className='mt-10 flex flex-col items-center'>
                            <Loading className='h-8' />
                        </div>
                    )
                }
                {
                    !loading && (
                        <div className=' grid grid-cols-2 gap-2'>

                            {
                                ChartTypes?.map((chartType, i) => {
                                    return (
                                        <div key={i} className='flex flex-col cursor-pointer hover:shadow-md scale-[98%] hover:scale-100 transition-all duration-300' onClick={onSelectChart.bind(null, chartType)}>
                                            <h3 className='text-base font-bold'>
                                                {chartType.toUpperCase()}
                                            </h3>
                                            <div className='' >
                                                <img src={images[i]} className=' w-full rounded-sm' alt="" />
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    )
                }
            </SheetContent>
        </Sheet>
    )
}