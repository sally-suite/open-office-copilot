import React, { useState, HTMLAttributes } from 'react';

interface ImageProps extends HTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
}

const Image: React.FC<ImageProps> = ({ src, alt, ...props }) => {
    const [hasError, setHasError] = useState(false);

    if (hasError) {
        return null;
    }

    return (
        <img
            src={src}
            alt={alt}
            {...props}
            onError={(e) => {
                setHasError(true);
                props.onError && props.onError(e);
            }}
        />
    );
};

export default Image;
