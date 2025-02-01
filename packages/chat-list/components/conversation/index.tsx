import React, { useEffect, useState } from 'react';
import userApi from '@api/user';
export default function Conversation() {
    const [list, setlist] = useState([]);
    const init = async () => {
        const result = await userApi.getConversation();
        setlist(result);
    };
    useEffect(() => {
        init();
    }, []);
    return (
        <div className='flex flex-col'>
            {list.map((item: any) => {
                return (
                    <div key={item.conversationId} className='p-2 hover:bg-gray-200'>
                        {item.conversationName}
                    </div>
                );
            })}
        </div>
    );
}
