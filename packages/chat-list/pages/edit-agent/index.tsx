import React from 'react';
import AgentForm from 'chat-list/components/agent-form';
export default function index() {

    const onSubmit = (data: any) => {
        // console.log(data)
    };
    return (
        <div className='p-2'>
            <AgentForm onSubmit={onSubmit} />
        </div>
    );
}
