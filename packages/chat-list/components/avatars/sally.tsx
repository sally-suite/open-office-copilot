import React from 'react';
import IconImage from '../icon-image';
import sallyPng from 'chat-list/assets/img/sally-32.png';

export default function Sally({ ...props }) {
    return (
        <IconImage src={sallyPng} className='h-6 w-6' {...props} >

        </IconImage>
    )
}
