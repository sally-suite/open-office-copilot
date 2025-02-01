import React, { useEffect, useRef, useState } from 'react';
import CardPPTRender from 'chat-list/components/card-ppt-render';
import temp6 from './templates/temp8';
import sample from './data/sample.json';

const PPTRender = () => {
    const [pages, setPages] = useState([]);

    const init = async () => {
        const list = await Promise.all(sample.map((item) => {
            return temp6.render(item, {
                colors: {
                    primary: '#000080',
                    secondary: '#4169E1',
                },
                fonts: {
                    title: 'SimHei',
                    body: 'SimSun',
                },
            });
        }));
        setPages(list);
    };
    useEffect(() => {
        init();
    }, []);
    return (
        <div className="flex flex-col h-screen w-full overflow-auto">
            <CardPPTRender
                slides={pages}
            />
        </div>
    );
};

export default PPTRender;
