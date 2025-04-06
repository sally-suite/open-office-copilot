import React, { useEffect, useState } from 'react';
import useChatState from 'chat-list/hook/useChatState';

import { useTranslation } from 'react-i18next';
import Avatar from '../avatars';

import { IChatPlugin } from 'chat-list/types/plugin';
import { useNavigate } from 'react-router-dom';

const AGENTS: { [x: string]: string[] } = {
    google: ['vision', 'uml', 'formula', 'python'],
    office: ['vision', 'uml', 'formula', 'python']
};

export default function ToolList() {
    const { t } = useTranslation(['base', 'tool']);
    const { plugin, platform, plugins, setMode, setAgentTools, chat, appendMsg, setTyping, setPlaceholder, showMessage } = useChatState();
    const [agents, setAgents] = useState([]);
    const navigate = useNavigate();

    const onSelect = (id: string) => {
        const tip = t(`tool:${id}.tip`, '');
        setPlaceholder(tip);
        setAgentTools([{ id, name: id, enable: true }]);
    };

    const onSelectAgent = (plg: IChatPlugin) => {
        // const plg = plugins.find(p => p.action == agent);
        // setPlugin(plg)
        setMode(plg.action, plg.mode || 'chat');
        navigate(`/${plg.action}`);
    };

    const init = () => {
        const map = AGENTS[platform] || [];
        const agents = plugins?.filter(p => map.includes(p.action));
        setAgents(agents);
    };

    useEffect(() => {
        init();
    }, []);

    return (
        <div className='flex flex-col text-sm '>
            <p className='markdown py-1'>
                {t('sheet.agent.sally.choose_tool')}
            </p>
            <div className='grid grid-cols-2 gap-2 mt-1'>
                {
                    plugin.tools?.map((id) => {
                        return (
                            <div
                                className='flex items-center justify-center py-1 px-1 text-center cursor-pointer rounded-xl border border-slate-200 bg-white select-none hover:bg-slate-100 hover:border-slate-100 transform transition-transform duration-200 hover:scale-102 active:scale-[98%] overflow-hidden'
                                key={id}
                                onClick={onSelect.bind(null, id)}
                            >
                                {t(`tool:${id}`)}
                            </div>
                        );
                    })
                }
            </div>
            <p className='text-base mt-3 mb-1'>
                {t('common.agents', 'Agents')}:
            </p>
            <div className='grid grid-cols-1 sm:grid-cols-1 gap-2 mt-1'>
                {
                    agents.map((plg) => {
                        return (
                            <div
                                className='flex items-center py-2 px-4 cursor-pointer rounded-2xl border border-slate-200 bg-white select-none hover:bg-slate-100 hover:border-slate-100 transform transition-transform duration-200 hover:scale-102 active:scale-[98%] overflow-hidden'

                                key={plg.action}
                                onClick={onSelectAgent.bind(null, plg)}
                            >

                                <div className=' w-9 shrink-0' >
                                    <Avatar icon={plg.icon} />
                                </div>
                                <div className='flex flex-col items-start text-sm overflow-hidden'>
                                    <div className='font-bold text-gray-900 max-w-fit'>
                                        {plg.name}
                                    </div>
                                    <div className=' text-gray-700 w-full overflow-hidden truncate overflow-ellipsis whitespace-nowrap'>
                                        {plg.shortDescription || plg.description}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                }
            </div>
        </div>

    );
}
