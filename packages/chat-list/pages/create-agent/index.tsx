import React, { useEffect, useRef, useState } from 'react';
import AgentForm from 'chat-list/components/agent-form';
import userApi from '@api/user';
import PageHeader from 'chat-list/components/header'
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'chat-list/components/ui/use-toast';
import ChatList from 'chat-list/components/chat-list'
import CustomePlugin from 'chat-list/plugins/custom'
import useChatState from 'chat-list/hook/useChatState';
import { IAgent } from 'chat-list/types/agent';
import Loading from 'chat-list/components/loading-logo'
export default function index() {
    const { setPlugins, setPlugin, plugins, docType, resetList, loadAgents } = useChatState();
    const [loading, setLoading] = useState(true)
    const [agent, setAgent] = useState<IAgent>()
    const pluginList = useRef(plugins);
    const navigate = useNavigate();
    const params = useParams();

    const onSubmit = async (data: any) => {
        if (!params.id) {
            await userApi.addAgent({
                type: docType,
                ...data
            });
            toast.show('Create agent successfully')
        } else {
            await userApi.updateAgent({
                id: params.id,
                type: docType,
                ...data
            })
            toast.show('Update agent successfully')
        }

        onBack();

    }
    const onFormChange = (values: any) => {
        if (!values.name) {
            return;
        }
        resetList([])
        const plg = new CustomePlugin(values);
        setPlugin(plg);
        const plgs = pluginList.current;
        setPlugins(plgs.concat([plg]));
    }
    const onBack = async () => {
        await loadAgents();
        // const plgs = pluginList.current;
        // resetList([]);
        // setPlugins(plgs);
        // setPlugin(plgs.find(p => p.action === plugins[0].action));
        navigate('/');
    }
    const init = async () => {

        setLoading(true)
        if (params.id) {
            const result = await userApi.getAgent(params.id);
            const plg = new CustomePlugin(result);
            setPlugin(plg);
            setAgent(result)
        }
        setLoading(false)
    }
    useEffect(() => {
        init();
    }, [])

    if (loading) {
        return (
            <Loading />
        );
    }
    return (
        <div className='flex flex-row h-screen overflow-hidden pt-8'>
            <PageHeader className=' fixed top-0 right-0 left-0 z-20 ' onBack={onBack} title='Create Agent' />
            <AgentForm docType={docType} value={agent} className='w-full sm:w-1/2 p-0 shrink-0 h-auto bg-white' onSubmit={onSubmit} onChange={onFormChange} />
            <ChatList className='sm:w-1/2 p-0 shrink-0 h-auto border-l hidden sm:inline-flex' />
        </div>
    )
}
