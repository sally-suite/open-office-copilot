import React, { useEffect, useState } from 'react';
import useChatState from 'chat-list/hook/useChatState';

import { useTranslation } from 'react-i18next';
import { ArrowLeft, Wrench } from 'lucide-react';
import sheetApi from '@api/sheet';
import Avatar from '../avatars';
import { useNavigate } from 'react-router-dom';
import { IChatPlugin } from 'chat-list/types/plugin';
import Tooltip from 'chat-list/components/tooltip';
interface IToolListProps {
    className?: string;
}

const GOOGLE_GPT_FUNCTIONS_EXAMPLE = [`=SALLY_GPT(A1,B1,"your prompt")`, `=SALLY_EXTRACT(A2,"name")`, `=SALLY_TRANS(A2,"english")`];
const GOOGLE_GPT_FUNCTIONS = ['SALLY_GPT', 'SALLY_EXTRACT', 'SALLY_TRANS'];

const OFFICE_GPT_FUNCTIONS_EXAMPLE = [`=SL.GPT3("What's your name?")`, `=SL.GPT4(A2,"Generate proposals ...")`];
const OFFICE_GPT_FUNCTIONS = ['SL.GPT3', 'SL.GPT4'];


const GPT_FUNCTION: { [x: string]: { name: string, functions: string[], examples: string[] } } = {
    google: {
        name: 'Google',
        functions: GOOGLE_GPT_FUNCTIONS,
        examples: GOOGLE_GPT_FUNCTIONS_EXAMPLE
    },
    office: {
        name: 'Office',
        functions: OFFICE_GPT_FUNCTIONS,
        examples: OFFICE_GPT_FUNCTIONS_EXAMPLE
    }
};

const AGENTS: { [x: string]: string[] } = {
    google: ['python', 'coder', 'translate', 'intelligent'],
    office: ['python', 'vba', 'translate', 'intelligent']
};

export default React.memo(function ToolList(props: IToolListProps) {

    const { className } = props;
    const { t } = useTranslation(['base', 'tool']);
    const { plugin, setAgentTools, platform, setText, tools, setPlugin, plugins, setMode, setPlaceholder } = useChatState();
    const formula = GPT_FUNCTION['google'];
    const [agents, setAgents] = useState([]);
    const navigate = useNavigate();

    const onSelect = (id: string) => {
        // const tool = tools.find(p => p.name == id);
        const tip = t(`tool:${id}.tip`, '');
        setPlaceholder(tip);
        setAgentTools([{ id, name: id, enable: true }]);
    };
    const onSelectFunction = async (index: number) => {
        await sheetApi.insertText(formula.examples[index]);
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
        <div className='flex flex-col text-sm relative'>
            {/* <p className='markdown py-1'>
                {t('sheet.agent.sally.choose_tool')}
            </p> */}
            <p className='text-base mt-3 mb-1'>
                {t('common.tools', 'Tools')}:
            </p>
            <div className='grid 2xs:grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 gap-2 mt-1'>
                {
                    plugin.tools?.map((id) => {
                        const plg: any = tools.find(p => p.name == id);
                        const Icon = plg.icon || Wrench;
                        return (
                            <div
                                className='flex items-center py-2 px-4 cursor-pointer rounded-2xl border border-slate-200 bg-white select-none hover:bg-slate-100 hover:border-slate-100 transform transition-transform duration-200 hover:scale-102 active:scale-[98%] overflow-hidden'
                                key={id}
                                onClick={onSelect.bind(null, id)}
                            >
                                <div className=' w-9 shrink-0' >
                                    <Icon width={20} height={20} />
                                </div>
                                <div className='flex flex-col items-start text-sm overflow-hidden'>
                                    <div className='font-bold text-gray-900 max-w-fit'>
                                        {t(`tool:${id}`)}
                                    </div>
                                    <div className=' text-gray-700 w-full overflow-hidden truncate overflow-ellipsis whitespace-nowrap'>
                                        {t(`tool:${id}.tip`)}
                                    </div>
                                </div>

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
            {
                platform == 'google' && formula && (
                    <>
                        <p className='text-base mt-3 mb-1'>
                            {t('common.gpt_formulas', 'GPT Formulas')}:
                        </p>
                        <div className='grid grid-cols-2 sm:grid-cols-2 gap-2 mt-1'>
                            {
                                formula?.functions.map((item, index) => {
                                    return (
                                        <Tooltip key={index} tip={formula?.examples[index]}>
                                            <div
                                                className=' h-8 flex flex-row items-center justify-center cursor-pointer border border-slate-200 bg-white relative group rounded-full sm:w-auto font-bold transform transition-transform duration-200 hover:scale-102 active:scale-[98%] hover:bg-slate-100 hover:border-slate-100'
                                                onClick={onSelectFunction.bind(null, index)}
                                            >
                                                <ArrowLeft height={14} width={14} className='absolute top-2 left-2 group-hover:-translate-x-1 transition-all' />
                                                <span className='ml-2  whitespace-nowrap overflow-hidden text-ellipsis'>{item}</span>
                                            </div>
                                        </Tooltip>

                                    );
                                })
                            }
                        </div>
                    </>
                )
            }
        </div>

    );
});
