import React, { useState } from 'react';
import Icon from 'chat-list/components/icon';
import Conversation from 'chat-list/components/conversation';

const LeftNavigation = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleNavigation = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="flex flex-col h-full w-64 border-r shadow-lg overflow-y-auto transition-transform duration-300 ease-in-out transform -translate-x-full md:translate-x-0 z-50">
            {/* Logo and New Chat button */}
            <div className="flex justify-between items-center px-4 py-2 hover:bg-gray-200 cursor-pointer ">
                <div className=" flex flex-row items-center">
                    <Icon
                        name="logo"
                        style={{
                            height: 28,
                            width: 28,
                        }}
                    />
                    <span className='ml-2'>
                        New Chat
                    </span>
                </div>
                <div className="py-2 px-4 rounded focus:outline-none focus:shadow-outline" onClick={toggleNavigation}>

                </div>
            </div>
            <div className="p-0 flex-1">
                <Conversation />
            </div>
            <div className="flex items-center p-4 border-t">
                <img className="h-8 w-8 rounded-full" src="https://via.placeholder.com/150" alt="User Avatar" />
                <div className="ml-2">Username</div>
            </div>
        </div>
    );
};

export default LeftNavigation;
