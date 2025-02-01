import React, { useState } from 'react';
import {
    Card,
    CardContent,
    CardTitle,
    // RadioGroup,
} from "chat-list/components/ui/card";
import slideApi from '@api/slide';
import IconButton from 'chat-list/components/icon-button';
import { FileOutput } from 'lucide-react';
import { getImgSize, proxyImage } from 'chat-list/utils';
import useChatState from 'chat-list/hook/useChatState';

interface ICardImagesProps {
    title: string;
    images: string[];
}

export default function CardSlideImages(props: ICardImagesProps) {
    const { title, images } = props;
    const [list, setList] = useState(images)
    const { platform } = useChatState();

    const insert = async (index: number) => {
        const imgUrl = list[index];
        if (platform === 'office') {
            const base64 = await proxyImage(imgUrl)
            const size = await getImgSize(base64)
            await slideApi.insertImage(base64, size.width, size.height);
        } else if (platform === 'google') {
            const base64 = await proxyImage(imgUrl)
            const size = await getImgSize(base64)
            await slideApi.insertImage(base64, size.width, size.height);
        }

    }
    const onRemove = (url: string) => {
        setList(list.filter((item) => item !== url));
    }
    if (!list || list.length == 0) {
        return null;
    }
    return (
        <Card className="w-full">
            <CardTitle>{title}</CardTitle>
            <CardContent className="w-full">
                <div className='grid grid-cols-2 gap-1'>
                    {list.map((item, index) => {
                        return (
                            <div key={item} className="relative"  >
                                <IconButton
                                    onClick={insert.bind(null, index)}
                                    icon={FileOutput}
                                    className=' w-auto ml-0 px-1 py-3 border-none absolute top-1 right-1 '
                                >
                                </IconButton>
                                <img style={{ width: '100%', height: 'auto' }} src={item} alt={title} onError={onRemove.bind(null, item)} ></img>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
