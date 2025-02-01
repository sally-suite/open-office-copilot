import { cn } from 'chat-list/lib/utils';
import { containsEmoji } from 'chat-list/utils';
import React from 'react'

interface IAvatarProps {
    /**
     *the icon is emoji,image,lucide-react icon,react node
     */
    icon: any;
    name?: string;
    alt?: string;
    className?: string;
    height?: number;
    width?: number;
    style?: React.CSSProperties;
}

export default function Avatar(props: IAvatarProps) {
    const { name, className, icon, width, height, style = {} } = props;
    const iconStyle = {
        height: height || 20,
        width: width || 20,
        ...style
    }
    let avatar;

    // if icon is image link or data:image or ext is png/jpeg/jpg
    if (typeof icon === 'string' && (icon.startsWith('http') || icon.startsWith('data:image') || icon.match(/\.(png|jpeg|jpg)$/i))) {
        avatar = <img src={icon} alt={props.alt} className={props.className} style={iconStyle} />
    }

    // if icon is lucide-react icon , lucide-react icon is object with displayName
    if (typeof icon === 'object' && icon.displayName) {
        const Icon = icon;
        avatar = <Icon className={props.className} height={height || 20} width={width || 20} style={props.style} />
    }

    // if icon is react node
    if (typeof icon === 'object' && icon.type) {
        avatar = <div className={props.className} style={iconStyle}>{icon}</div>
    }

    // if icon is react hook function or a react class
    if (typeof icon === 'function') {
        const Icon = icon;
        avatar = (
            <Icon className={props.className} height={props.height} width={props.width} style={iconStyle} />
        )
    }
    if (typeof icon === 'string' && containsEmoji(icon)) {
        avatar = <span className={cn(`flex flex-row items-center justify-center`, className)} style={{
            fontSize: iconStyle.width,
            ...iconStyle
        }}>{icon}</span>
    }

    if (!name) {
        return avatar;
    }

    return (
        <div className={cn(`flex flex-row items-center text-sm`, className)} >
            {avatar} <span className='ml-1'>{name}</span>
        </div>
    )
}
