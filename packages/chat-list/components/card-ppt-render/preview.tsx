import { SlideElement, Slide } from 'chat-list/types/api/slide';
import { hexToRgba } from 'chat-list/utils';
import { generateEChartsOption, renderEChart } from 'chat-list/utils/chart';
import React, { useEffect, useRef, useState } from 'react';
// import { LineChart, BarChart, XAxis, YAxis, Tooltip, Legend, Line, Bar } from 'recharts';

const alignMap = {
    'left': 'flex-start',
    'center': 'center',
    'right': 'flex-end',
}

const vAlignMap = {
    'top': 'flex-start',
    'middle': 'center',
    'bottom': 'flex-end',
}

// 组件 props 类型
interface SlideElementProps {
    element: SlideElement;
    onSelectElement?: (element: SlideElement) => void;
}

interface SlideProps {
    slide: Slide;
    onSelect?: (slide: Slide) => void;
    onSelectElement?: (element: SlideElement, index: number) => void;
}


interface PPTRendererProps {
    slides: Slide[];
    onSelectSlide?: (slide: Slide, index: number) => void;
    onSelectElement?: (element: SlideElement, slideIndex: number, elementIndex: number) => void;
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
            }
        }
        return {
            padding: pTtoPx(margin) + 'px'
        }
    }
    const pTtoPx = (value: number) => value * 1.33;

    let alignStyle = {}

    if (element?.style?.align) {
        alignStyle = {
            display: 'flex',
            justifyContent: alignMap[element?.style?.align || 'left'],
            alignItems: vAlignMap[element?.style?.valign || 'middle'],
        }
    }


    const style: React.CSSProperties = {
        position: 'absolute',
        left: `${element.position.x * 96}px`,
        top: `${element.position.y * 96}px`,
        width: `${element.size.width * 96}px`,
        height: `${element.size.height * 96}px`,
        backgroundColor: hexToRgba(element.style?.fill?.color, 1 - ((element.style?.fill?.transparency || 0)) / 100),

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
                        backgroundColor: block.style?.fill?.color || 'none',
                        opacity: (1 - (block.style?.fill?.transparency / 100)) || 1,
                    };
                    return <p key={index} style={textStyle} className='p-0 m-0'>{block.text}</p>;
                })
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
                    backgroundColor: element.style?.fill?.color || 'none',
                    opacity: (1 - (element.style?.fill?.transparency / 100)) || 1,
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
                <img
                    src={element.src}
                    className='border'
                    alt="Slide content"
                    style={{
                        ...style,
                        objectFit: 'contain',
                        border: '1px solid #000000'
                    }}
                />
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
                                                borderBottom: '1px dashed #000000',
                                                borderRight: cellIndex !== row.length - 1 ? '1px dashed #000000' : 'none',
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
                                                borderBottom: rowIndex !== element.table.rows.length - 2 ? '1px dashed #000000' : 'none',
                                                borderRight: cellIndex !== row.length - 1 ? '1px dashed #000000' : 'none',
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
            //     backgroundColor: 'transparent',
            //     borderRadius: element.style?.rectRadius * 100
            // });
            return (
                <div style={{
                    ...style,
                    backgroundColor: 'transparent',
                    overflow: 'hidden',
                    borderRadius: 10
                }}>
                    <img src={element.chartImage} alt="" />
                </div>
            );
        default:
            return null;
    }
};

const SlidePage: React.FC<SlideProps> = ({ slide, onSelect, onSelectElement }) => {
    const contianerRef = useRef(null)
    const slideRef = useRef(null);
    const [elements, setElements] = useState([]);
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
    }
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    const annimation = async () => {
        for (const element of slide.elements) {
            await sleep(300)
            setElements(prevElements => [...prevElements, element]);
        }
    }
    const init = async () => {
        // if (elements.length == 0) {
        //     annimation();
        // } else {
        //     // 
        // }
        setElements(slide.elements)
    }
    const onSelectSlide = () => {
        onSelect?.(slide)
    }

    useEffect(() => {
        resizeSlide();
    }, [])

    useEffect(() => {
        init()
    }, [slide.elements])

    return (
        <div ref={contianerRef}
            className='relative'
            style={{
                width: '100%',
            }}
            onClick={onSelectSlide}
        >
            <div ref={slideRef} style={slideStyle} className=' border-4 absolute top-0 left-0 transform origin-top-left hover:cursor-pointer shadow-xl hover:shadow-2xl select-none'>
                {elements.map((element, index) => (
                    <SlideEle key={index} element={element} onSelectElement={() => {
                        onSelectElement?.(element, index)
                    }} />
                ))}
            </div>
        </div>
    );
};

export const PPTPreview: React.FC<PPTRendererProps> = ({ slides, onSelectSlide, onSelectElement }) => {
    return (
        <div className='grid grid-cols-2 md:grid-cols-1 gap-2'>
            {slides.map((slide, index) => (
                <SlidePage
                    key={index}
                    slide={slide}
                    onSelect={() => {
                        onSelectSlide?.(slide, index)
                    }}
                />
            ))}
        </div>
    );
};

export default PPTPreview;