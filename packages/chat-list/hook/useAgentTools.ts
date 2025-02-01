import React, { useEffect, useState } from 'react'
import useLocalStore from './useLocalStore';
import { AGENT_AGENT, AGENT_TOOL, getLocalStore } from 'chat-list/local/local';
import { IAgentTools, IChatPlugin, IAgentToolItem, DocType } from 'chat-list/types/plugin';
import { snakeToWords } from 'chat-list/utils';


export default function useAgentTools(plugin: IChatPlugin, plugins: IChatPlugin[], docType: DocType): IAgentTools {
    const agentToolKey = `${docType}_${AGENT_TOOL}_${plugin.action}`;
    const colAgentKey = `${docType}_${AGENT_AGENT}_${plugin.action}`;
    // const { value: agentTools, setValue: setAgentTools } = useLocalStore(agentToolKey, null);
    // const { value: colAgents, setValue: setColAgents } = useLocalStore(colAgentKey, null);
    const [colAgents, setColAgents] = useState([]);
    const [agentTools, setAgentTools] = useState([]);
    const setAgentTool = (id: string, enable: boolean) => {
        // 设置当前插件的agentTools
        // const list = agentTools?.map((item: IAgentToolItem) => {
        //     if (item.id === id) {
        //         return { ...item, enable }
        //     }
        //     return item;
        // });
        if (enable) {
            if (agentTools.find(item => item.id === id)) {
                return;
            }
            setAgentTools([...agentTools, { id, enable }])
        } else {
            setAgentTools(agentTools.filter((item: IAgentToolItem) => item.id !== id))
        }
    }
    const setColAgent = (id: string, enable: boolean) => {
        // 设置当前插件的colAgents
        const list = colAgents?.map((item: IAgentToolItem) => {
            if (item.id === id) {
                return { ...item, enable }
            }
            return item;
        })
        setColAgents(list);
    }
    const init = () => {

        // const tools = plugin.tools;
        // setAgentTools(tools.map((name) => {
        //     return {
        //         id: name,
        //         name: snakeToWords(name),
        //         enable: false
        //     }
        // }));


        // const tools = plugin.tools;
        // const agentTools: IAgentToolItem[] = getLocalStore(agentToolKey)
        // if (!agentTools) {
        //     setAgentTools(tools.map((name) => {
        //         return {
        //             id: name,
        //             name: snakeToWords(name),
        //             enable: true
        //         }
        //     }));
        // } else {
        //     const newList = agentTools.filter(p => {
        //         return tools.find(name => p.id === name)
        //     }).concat(tools.filter(p => {
        //         return !agentTools.find(item => item.id === p)
        //     }).map((name) => {
        //         return {
        //             id: name,
        //             name: snakeToWords(name),
        //             enable: true
        //         }
        //     }))
        //     setAgentTools(newList)
        // }
        // const agents = plugin.agents;
        // const colAgents: IAgentToolItem[] = getLocalStore(colAgentKey)
        // if (!colAgents) {
        //     setColAgents(agents
        //         .filter(name => {
        //             return plugins.find(p => p.action == name)
        //         })
        //         .map((name) => {
        //             const plg = plugins.find(p => p.action == name);
        //             return {
        //                 id: plg.action,
        //                 icon: plg.icon,
        //                 name: plg.name,
        //                 enable: true
        //             }
        //         }));
        // } else {
        //     const newList = colAgents.filter(p => {
        //         return agents.find(name => p.id === name)
        //     }).concat(agents.filter(p => {
        //         return !colAgents.find(item => item.id === p)
        //     }).map((name) => {
        //         return {
        //             id: name,
        //             name: snakeToWords(name),
        //             enable: true
        //         }
        //     }))
        //     setColAgents(newList)
        // }

        const tools = plugin.tools;
        setAgentTools(tools.map((name) => {
            return {
                id: name,
                name: snakeToWords(name),
                enable: true
            }
        }));

        const agents = plugin.agents;
        const colAgents = agents.map((name) => {
            const plg = plugins.find(p => p.action == name);
            if (!plg) {
                return null;
            }
            return {
                id: plg.action,
                icon: plg.icon,
                name: plg.name,
                enable: true
            }
        }).filter(p => !!p);
        setColAgents(colAgents);

    }
    const reset = () => {
        const tools = plugin.tools;
        setAgentTools(tools.map((name) => {
            return {
                id: name,
                name: snakeToWords(name),
                enable: true
            }
        }));

        const agents = plugin.agents;
        const colAgents = agents.map((name) => {
            const plg = plugins.find(p => p.action == name);
            return {
                id: plg.action,
                icon: plg.icon,
                name: plg.name,
                enable: true
            }
        })
        setColAgents(colAgents);
    }
    // useEffect(() => {
    //     init();
    // }, [plugin])
    return {
        agentTools,
        colAgents,
        setAgentTool,
        setColAgent,
        setAgentTools,
        setColAgents,
        reset
    }
}
