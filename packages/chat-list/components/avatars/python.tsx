import React from 'react';
import IconImage from '../icon-image';
import png from 'chat-list/assets/img/python-32.png';



export default function Python({ ...props }) {
    return (
        <IconImage src={png} className='h-6 w-6' {...props} >

        </IconImage>
    );
}
