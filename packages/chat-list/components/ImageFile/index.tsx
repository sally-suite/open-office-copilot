import { blobToBase64 } from 'chat-list/utils';
import React, { useEffect, useState } from 'react';

interface ImageFileProps {
    file: File,
}

export default function ImageFile(props: ImageFileProps) {
    const { file, ...rest } = props;
    const [base64, setBase64] = useState('');
    const loadImage = async () => {
        const base64 = await blobToBase64(file);
        setBase64(`data:${file.type};base64,${base64}`);
    };
    useEffect(() => {
        loadImage();
    }, []);

    if (!base64) {
        return null;
    }
    return (
        <img src={base64} {...rest} />
    );
}
