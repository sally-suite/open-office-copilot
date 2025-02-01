import { SlideElement, Slide } from 'chat-list/types/api/slide';
import React, { useEffect, useRef, useState } from 'react';
// import { LineChart, BarChart, XAxis, YAxis, Tooltip, Legend, Line, Bar } from 'recharts';
import { BookTemplate, FileOutput, LayoutDashboard, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import IconButton from '../icon-button';
import { generateEChartsOption, renderEChart } from 'chat-list/utils/chart';
import { debounce, hexToRgba } from 'chat-list/utils';
import useChatState from 'chat-list/hook/useChatState';

const alignMap = {
    'left': 'flex-start',
    'center': 'center',
    'right': 'flex-end',
};

const vAlignMap = {
    'top': 'flex-start',
    'middle': 'center',
    'bottom': 'flex-end',
};

// 组件 props 类型
interface SlideElementProps {
    element: SlideElement;
    onSelectElement?: (element: SlideElement) => void;
}

interface SlideProps {
    slide: Slide;
    onSelect?: (slide: Slide) => void;
    onSelectElement?: (element: SlideElement, index: number) => void;
    onInsert?: (slide: Slide) => void;
    onChangeTemplate: (slide: Slide) => void;
}


interface PPTRendererProps {
    slides: Slide[];
    onSelectSlide?: (slide: Slide, index: number) => void;
    onSelectElement?: (element: SlideElement, slideIndex: number, elementIndex: number) => void;
    onInsert?: (slide: Slide, index: number) => void;
    onChangeTemplate?: (slide: Slide, index: number) => void;
}

const SlideEle: React.FC<SlideElementProps> = ({ element, onSelectElement }) => {
    const convertMarginToPad = (margin: number | [number, number, number, number]) => {
        if (!margin) {
            return {};
        }
        if (Array.isArray(margin)) {
            //新建一个数组， 把第一个元素移动到最后，
            const newMargin = [...margin];
            newMargin.push(newMargin.shift() as number);
            return {
                padding: newMargin.map((m) => pTtoPx(m)).join('px ') + 'px'
            };
        }
        return {
            padding: pTtoPx(margin) + 'px'
        };
    };
    const pTtoPx = (value: number) => value * 1.33;

    let alignStyle = {};

    if (element?.style?.align) {
        alignStyle = {
            display: 'flex',
            // flexDirection: 'column',
            justifyContent: alignMap[element?.style?.align || 'left'],
            alignItems: vAlignMap[element?.style?.valign || 'middle'],
        };
    }


    const style: React.CSSProperties = {
        flexDirection: 'row',
        position: 'absolute',
        left: `${element.position.x * 96}px`,
        top: `${element.position.y * 96}px`,
        width: `${element.size.width * 96}px`,
        height: `${element.size.height * 96}px`,
        backgroundColor: hexToRgba(element.style?.fill?.color, 1 - (element.style?.fill?.transparency || 0) / 100),
        ...alignStyle
    };


    switch (element.type) {
        case 'title':
        case 'text':
            if (Array.isArray(element.content)) {
                const blocks = element.content.map((block, index) => {
                    const padding = convertMarginToPad(block.style.margin);
                    const textStyle: React.CSSProperties = {
                        fontSize: `${pTtoPx(block.style.fontSize)}px`,
                        color: block.style.color,
                        fontFamily: block.style.fontFamily,
                        fontWeight: block.style.bold ? 'bold' : 'normal',
                        fontStyle: block.style.italic ? 'italic' : 'normal',
                        textDecoration: block.style?.underline ? 'underline' : 'none',
                        listStyleType: block.style?.bullet ? 'disc' : 'none',
                        marginLeft: block.style?.bullet ? '20px' : '0',
                        lineHeight: `${pTtoPx(block.style.lineSpacing)}px`,
                        paddingTop: `${pTtoPx(block.style.spaceBefore)}px`,
                        paddingBottom: `${pTtoPx(block.style.spaceAfter)}px`,
                        ...padding,
                        overflow: 'hidden',
                        background: block.style?.fill?.color || 'none',
                        opacity: (1 - (block.style?.fill?.transparency / 100)) || 1,
                        userSelect: 'none'
                    };
                    return <p key={index + block.text} style={textStyle} className='p-0 m-0'>{block.text}</p>;
                });
                return <div style={style} >{blocks}</div>;
            } else {
                const padding = convertMarginToPad(element.style.margin);
                // eslint-disable-next-line no-case-declarations
                const textStyle: React.CSSProperties = {
                    ...style,
                    fontSize: `${pTtoPx(element.style.fontSize)}px`,
                    color: element.style.color,
                    fontFamily: element.style.fontFamily,
                    fontWeight: element.style.bold ? 'bold' : 'normal',
                    fontStyle: element.style.italic ? 'italic' : 'normal',
                    textDecoration: element.style.underline ? 'underline' : 'none',
                    listStyleType: element.style.bullet ? 'disc' : 'none',
                    marginLeft: element.style.bullet ? '20px' : '0',
                    lineHeight: `${pTtoPx(element.style.lineSpacing)}px`,
                    paddingTop: `${pTtoPx(element.style.spaceBefore)}px`,
                    paddingBottom: `${pTtoPx(element.style.spaceAfter)}px`,
                    ...padding,
                    textAlign: element.style.align,
                    overflow: 'hidden',
                    background: element.style?.fill?.color || 'none',
                    opacity: (1 - (element.style?.fill?.transparency / 100)) || 1,
                    userSelect: 'none'
                };
                return <div style={textStyle}>{element.content}</div>;
            }
        case 'shape':
            // eslint-disable-next-line no-case-declarations
            const textStyle: React.CSSProperties = {
                ...style,
                backgroundColor: element.style?.fill?.color || '#FFFFFF',
                opacity: (1 - (element.style?.fill?.transparency / 100)) || 1,
                borderRadius: element.style?.rectRadius * 100
            };
            return <div style={textStyle}></div>;

        case 'image':
            return (
                <div className=' hover:opacity-50 hover:cursor-pointer'
                    style={{
                        ...style,
                    }}
                    onClick={(e) => {
                        if (onSelectElement) {
                            e.stopPropagation();
                            onSelectElement?.(element);
                        }
                    }}
                >
                    {
                        element.src === 'loading' && (
                            <div className='flex justify-center items-center h-full w-full'>
                                <Loader2 height={100} width={100} className='rotate text-gray-400' />
                            </div>
                        )
                    }
                    {
                        element.src !== 'loading' && <img
                            src={element.src}
                            className='border'
                            alt="Slide content"
                            style={{
                                // ...style,
                                height: '100%',
                                width: '100%',
                                objectFit: 'contain'
                            }}
                        />
                    }
                </div>

            );
        case 'table':

            return (
                <div style={style}>
                    <table className="w-full h-full border-collapse">
                        <thead>
                            {element.table.rows.slice(0, 1).map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                    {row.map((cell, cellIndex) => (
                                        <th
                                            key={cellIndex}
                                            className="font-bold"
                                            style={{
                                                borderBottom: `1px dashed `,
                                                borderRight: cellIndex !== row.length - 1 ? '1px dashed' : 'none',
                                                padding: '4px',
                                                paddingLeft: '10px',
                                                paddingRight: '10px',
                                                fontFamily: cell?.options?.fontFace || 'Arial',
                                                borderColor: cell?.options?.border[0].color,
                                                color: cell?.options?.color || 'black'
                                            }}
                                        >
                                            {cell.text}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody>
                            {element.table.rows.slice(1).map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                    {row.map((cell, cellIndex) => (
                                        <td
                                            key={cellIndex}
                                            style={{
                                                borderBottom: rowIndex !== element.table.rows.length - 2 ? '1px dashed ' : 'none',
                                                borderRight: cellIndex !== row.length - 1 ? '1px dashed ' : 'none',
                                                padding: '4px',
                                                paddingLeft: '10px',
                                                paddingRight: '10px',
                                                fontFamily: cell?.options?.fontFace || 'Arial',
                                                borderColor: cell?.options?.border[0].color,
                                                color: cell?.options?.color || 'black'
                                            }}
                                        >
                                            {cell.text}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        case 'chart':

            // eslint-disable-next-line no-case-declarations
            // const config = generateEChartsOption(element.chartType, element.data, {
            //     title: '',
            // });
            // // eslint-disable-next-line no-case-declarations
            // const chartImg = renderEChart({
            //     ...config,
            //     width: `${element.size.width * 96}px`,
            //     height: `${element.size.height * 96}px`,
            //     backgroundColor: hexToRgba(element.style?.fill?.color, 1 - ((element.style?.fill?.transparency || 0)) / 100),
            // });
            return (
                <div
                    style={{
                        ...style,
                        backgroundColor: 'transparent',
                        overflow: 'hidden',
                        borderRadius: 10
                    }}
                    className='relative hover:opacity-50 hover:cursor-pointer'
                    onClick={(e) => {
                        if (onSelectElement) {
                            e.stopPropagation();
                            onSelectElement?.(element);
                        }
                    }}
                >
                    <img src={element.chartImage} className=' relative z-20' />
                </div >
            );
        default:
            return null;
    }
};

const SlidePage: React.FC<SlideProps> = ({ slide, onSelect, onSelectElement, onInsert, onChangeTemplate }) => {
    const contianerRef = useRef(null);
    const { t } = useTranslation();
    const slideRef = useRef(null);
    const [elements, setElements] = useState([]);
    const { platform } = useChatState();
    const animateRunning = useRef(0);
    const width = 1276.8;
    const height = 720;
    const slideStyle: React.CSSProperties = {
        width: '1276.8px',
        height: '720px',
        position: 'relative',
        backgroundColor: slide.background.color || '#FFFFFF',
        backgroundImage: slide.background.image ? `url(${slide.background.image})` : 'none',
        backgroundSize: 'cover',
        marginBottom: '20px',
        overflow: 'hidden',
    };
    const resizeSlide = () => {
        const containerWidth = contianerRef.current.clientWidth;
        // const containerHeight = contianerRef.current.clientHeight;

        // 计算缩放比例
        const scaleX = containerWidth / width;
        // const scaleY = containerHeight / height;
        // const scale = Math.min(scaleX, scaleY); // 取最小比例以确保内容不溢出
        contianerRef.current.style.height = `${height * scaleX}px`;
        slideRef.current.style.transform = `scale(${scaleX})`;
        // slideRef.current.style.opacity = 1;
    };
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    const annimation = async () => {
        for (const element of slide.elements) {
            await sleep(200);
            setElements(prevElements => [...prevElements, element]);
        }
    };
    const init = async () => {
        if (animateRunning.current >= 2) {
            setElements(slide.elements);
            return;
        } else if (animateRunning.current == 1) {
            return;
        }
        animateRunning.current = 1;
        await annimation();
        animateRunning.current = 2;
    };
    const onSelectSlide: React.MouseEventHandler<HTMLDivElement> = (e) => {
        e.stopPropagation();
        e.preventDefault();
        onSelect?.(slide);
    };

    const onInsertSlide = async (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.stopPropagation();
        await onInsert?.(slide);
    };

    const onUpdateTemp = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.stopPropagation();
        onChangeTemplate?.(slide);
    };

    useEffect(() => {
        const handleResize = () => {
            resizeSlide();
        };

        const debounceResize = debounce(handleResize, 300);

        window.addEventListener('resize', debounceResize);

        resizeSlide();

        return () => {
            window.removeEventListener('resize', debounceResize);
        };
    }, []);

    useEffect(() => {
        init();
    }, [slide]);

    // useEffect(() => {
    //     if (animateRunning.current) {
    //         return;
    //     }
    //     setElements(slide.elements)
    // }, [slide])

    return (
        <div ref={contianerRef}
            className='relative group'
            style={{
                width: '100%',
            }}
            onClick={onSelectSlide}
        >
            <div ref={slideRef} style={slideStyle} className=' border-2 absolute top-0 left-0 transform origin-top-left shadow-xl hover:shadow-2xl select-none'>
                {elements.map((element, index) => (
                    <SlideEle
                        key={index}
                        element={element}
                        onSelectElement={() => {
                            onSelectElement?.(element, index);
                        }}
                    />
                ))}

            </div>
            <div className='absolute left-1 bottom-1 h-8 p-2 space-x-1 flex flex-row items-center opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out' >
                {
                    (platform == 'office' || platform == 'google') && (
                        <IconButton icon={FileOutput} className='w-auto sm:w-auto px-1 h-6 shadow-sm text-sm' onClick={onInsertSlide} >
                            {t('common.insert')}
                        </IconButton>
                    )
                }
                <IconButton icon={LayoutDashboard} className='w-auto sm:w-auto px-1 h-6 shadow-sm text-sm' onClick={onUpdateTemp} >
                    {t('common.change_template')}
                </IconButton>
            </div>
        </div>
    );
};

const PPTRenderer: React.FC<PPTRendererProps> = ({ slides, onSelectSlide, onSelectElement, onChangeTemplate, onInsert }) => {
    return (
        <div className='grid grid-cols-1 gap-2'>
            {slides.map((slide, index) => (
                <SlidePage
                    key={index}
                    slide={slide}
                    onInsert={async () => {
                        await onInsert?.(slide, index);
                    }}
                    onChangeTemplate={() => {
                        onChangeTemplate?.(slide, index);
                    }}
                    onSelect={() => {
                        onSelectSlide?.(slide, index);
                    }}
                    onSelectElement={(element, i) => {
                        onSelectElement?.(element, index, i);
                    }}
                />
            ))}
        </div>
    );
};

export default PPTRenderer;

export const PPTPreview: React.FC<PPTRendererProps> = ({ slides, onSelectSlide, onSelectElement }) => {
    return (
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2'>
            {slides.map((slide, index) => (
                <SlidePage
                    key={index}
                    slide={slide}
                    onSelect={() => {
                        onSelectSlide?.(slide, index);
                    }}
                    onSelectElement={(element, i) => {
                        onSelectElement?.(element, index, i);
                    }}
                />
            ))}
        </div>
    );
};