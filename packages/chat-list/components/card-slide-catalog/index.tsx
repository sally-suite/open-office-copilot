import React, { useEffect, useState } from 'react'
import {
    Card,
    CardContent,
    CardTitle,
    CardActions,
    // RadioGroup,
} from "chat-list/components/ui/card";
import { Textarea } from '../ui/textarea';
import Button from '../button';

interface ICatalogProps {
    value: string;
    onChange: (value: string) => void;
}

export default function Catalog(props: ICatalogProps) {
    const { value, onChange } = props;
    const [text, setText] = useState(value)
    const onTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
    }
    const onOk = () => {
        onChange(text);
    }
    useEffect(() => {
        setText(value)
    }, [value])
    return (
        <Card className="w-full">
            <CardTitle> </CardTitle>
            <CardContent className=" flex flex-row flex-wrap justify-center">
                <Textarea value={text} onChange={onTextChange} placeholder="请输入内容" className="w-full"></Textarea>
            </CardContent >
            <CardActions>
                <Button className="w-full" onClick={onOk}>确定</Button>
            </CardActions>
        </Card>
    );
}
