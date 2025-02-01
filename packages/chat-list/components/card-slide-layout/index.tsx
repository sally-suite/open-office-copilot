import React, { useState } from 'react';
import {
    Card,
    CardContent,
    CardTitle,
    CardActions,
    // RadioGroup,
} from "chat-list/components/ui/card";
import Button from '../button';
import { ILayoutElement } from 'chat-list/types/slide';
import { cn } from 'chat-list/lib/utils';

interface ICardLayoutProps {
    elements: ILayoutElement[];
}
const list = ['4:3', '16:9'];
export default function CardLayout(props: ICardLayoutProps) {
    const { elements } = props;
    const [ratio, setRatio] = useState('4:3');
    const onInsert = () => {
        console.log('insert');
    };
    const renderElement = (item: ILayoutElement) => {
        if (item.type === 'title') {
            return (
                <h1 className='text-xl h-full flex flex-row items-center '>{item.title}</h1>
            );
        } else if (item.type == 'text') {
            return <p >{item.text}</p>;
        } else if (item.type == 'list') {
            return (
                <ol >
                    {item.list.map((item, index) => {
                        return <li key={index}>{item}</li>;
                    })}
                </ol>
            );
        } else if (item.type == 'image') {
            return <img src={item.image} alt="" />;
        }
        return null;
    };
    // 获取窗口的宽度，除以960，得到比例值
    const rate = (window.innerWidth - 24) / 960;

    return (
        <Card className="w-full">
            <CardTitle>Layout</CardTitle>
            <CardContent className="w-full">
                <div className='border relative mx-auto rounded' style={{
                    height: 720,
                    width: 960,
                    zoom: rate
                }}>
                    {elements.map((item, index) => {
                        return (
                            <div key={index} className='border border-dashed' style={{
                                height: item.height,
                                width: item.width,
                                top: item.top,
                                left: item.left,
                                position: 'absolute',
                                // zoom: 0.5
                            }} >
                                {renderElement(item)}
                            </div>
                        );
                    })}
                </div>
                <div className='mt-1'>
                    <label className='label'> Aspect ratio:</label>
                    <div className='flex flex-row w-40 items-center space-x-2 mt-1'>
                        {
                            list.map((item) => {
                                return (
                                    <div key={item} className={cn(
                                        'border rounded-sm cursor-pointer px-2',
                                        ratio == item ? "bg-primary text-white" : ""
                                    )}
                                        onClick={() => {
                                            console.log(item);
                                            setRatio(item);
                                        }}
                                    >
                                        {item}
                                    </div>
                                );
                            })
                        }
                    </div>
                </div>
            </CardContent>
            <CardActions>
                <Button action="create" color="primary" onClick={onInsert}>
                    Insert
                </Button>
            </CardActions>
        </Card>
    );
}
