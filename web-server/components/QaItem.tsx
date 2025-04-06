// QaItem.js
import React, { useState } from 'react';

const QaItem = ({ question, answer }) => {
    // const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="bg-white p-4 rounded-lg shadow m-4 text-left">
            {/* <div
                className={`cursor-pointer ${isOpen ? 'text-green' : 'text-black'}`}
                onClick={() => setIsOpen(!isOpen)}
            >
              
            </div> */}
            <h2 className="text-lg font-semibold">{question}</h2>
            <p className="text-gray-600 mt-2">{answer}</p>
        </div>
    );
};

export default QaItem;
