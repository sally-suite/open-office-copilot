import React from 'react';

export default function Link(props: any = {}) {
    return (
        <a target='_blank' {...props} />
    );
}
