import React from 'react';
import Bubble from '../bubble';
import './style.less';

export default function Typing() {
    return (
        <Bubble type="typing" >
            <div className="Typing" >
                <div className="Typing-dot" />
                <div className="Typing-dot" />
                <div className="Typing-dot" />
            </div>
        </Bubble>
    );
}
