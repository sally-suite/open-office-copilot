import React from 'react'
export interface IconImageProps {
    src: string;
    alt?: string;
    className?: string;
    height?: number;
    width?: number;
    style: React.CSSProperties;
}
export default function IconImage(props: IconImageProps) {
    const { src, alt, className, height, width, style, ...rest } = props;
    if (height && width) {
        return <img src={src} alt={alt} className={className} style={{ height, width, ...style }} {...rest} />
    }
    return (
        <img src={src} alt={alt} className={className} {...rest} />
    )
}
