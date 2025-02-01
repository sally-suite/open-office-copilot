import React from 'react';
import Icon from 'chat-list/components/icon';
import { capitalizeFirstLetter } from 'chat-list/utils';
import Avatar from 'chat-list/components/avatars';
// Define the props for the ToolbarItem
export interface ToolbarItemProps {
    type: string;
    title: string;
    icon?: React.Component;
    img?: string;
    render?: any;
}

// Define the props for the Toolbar component
interface ToolbarProps {
    items: ToolbarItemProps[];
    onClick: (item: ToolbarItemProps, event: React.MouseEvent<HTMLButtonElement>) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ items, onClick }) => {
    return (
        <div className="flex flex-wrap">
            {items.map((item, index) => {
                return (
                    <div key={index} className="w-1/4 px-0 py-1  text-gray-500">
                        <button
                            className="flex flex-col items-center w-full "
                            onClick={(e) => onClick(item, e)} // Handle button click
                        >
                            <div className='bg-white shadow-md p-4 rounded-xl transition-transform transform hover:scale-105'>

                                {item.icon && (
                                    <Avatar icon={item.icon || item.img} height={24} width={24} />
                                )}
                                {item.render && item.render()}
                            </div>
                            <div className="text-center mt-1 text-sm">{capitalizeFirstLetter(item.title)}</div>
                        </button>
                    </div>
                );
            })}
        </div>
    );
};

export default Toolbar;
