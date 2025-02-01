import { ChatMessageType, ChatMessageWithoutId, IChatMessage, IChatOptions, QuickReplyItem, Sender } from "chat-list/types/message";
import { ReactNode } from "react";
import { adaptToolArguments, extractJsonDataFromMd, memoize, removeMentions, sleep, snakeToWords, template, uuid } from "chat-list/utils";
import { GptModel, IChatBody, IChatResult, ICompletionsBody, IMessageBody, Role, ToolFunctinCall, ToolFunction } from "./chat";
import React from "react";
import { IUserState } from "./user";
import { AGENT_AGENT, getLocalStore } from "chat-list/local/local";
import i18n from 'chat-list/locales/i18n';
import ContextText from 'chat-list/components/context-text';
import { IsSupportToolCallModel } from "chat-list/config/model";
import taskExecListPrompt from 'chat-list/service/react/task_exec_list.md';


export interface IModelConfig {
    model?: GptModel;
    temperature?: number;
    prompt?: string;
}

export type DocType = 'sheet' | 'doc' | 'slide' | 'chat' | 'side' | 'email';

/**
 * Render mode
 * - chat: Chat list
 * - custom: Use render function to custom UI.
 */
export type ModeType = 'chat' | 'custom' | 'mixed' | string;

export type Platform = 'google' | 'office' | 'only' | 'chrome' | 'other';

export interface FileAccept {
    image?: boolean;
    xlsx?: boolean;
    text?: boolean;
    video?: boolean;
    audio?: boolean;
}
export interface IChatPluginRenderProps {
    context: ChatState;
}

export type IToolFunction = (args: {
    from?: Sender,
    dataContext?: string,
    context?: ChatState,
    message?: IChatMessage,
    [x: string]: unknown
}) => Promise<string>;

export interface ITool {
    name: string;
    displayName?: string;
    description: string;
    parameters: { [x: string]: unknown };
    func: IToolFunction;
    tip?: string;
}

export interface IChatPlugin {
    /**
     * id
     */
    id?: string;
    /**
     * chat context
     */
    context: ChatState;
    /**
     * suport models value include :'gpt-3.5-turbo' | 'gpt-4' | 'gemini-pro' | 'gemini-pro-vision';
     */
    models?: GptModel[];
    /**
     * document type
     */
    docType?: DocType;
    /**
     * is custome agent
     */
    isCustom: boolean;
    /**
     * Add-on name, shown in placeholder
     */
    name: string;
    /**
     * render mode chat or custom,default is chat
     */
    mode?: ModeType;
    /**
     * Icon of plugin
     */
    icon: string | React.ReactNode | any;
    /**
     * Plugin startup command that uniquely identifies the plugin, starts with /.
     */
    action: string;
    /**
     * instruction of agent
     */
    instruction: string;
    /**
     * descrition for command list
     */
    shortDescription: string;
    /**
     * descrition for agent as a tool
     */
    description: string;
    /**
     * Parameters need to pass to gpt functions
     */
    parameters?: { type: string, properties: any }
    /**
     * Show placeholder in message input box
     */
    placeholder?: string;
    /**
     * When the user enters a command, use this field to reply user
     * to tell user how to use this feature,or show a card
     */
    introduce: string | (() => React.ReactNode);
    model?: IModelConfig;
    tools: string[];
    agents: string[];
    quickReplies: (input: string) => QuickReplyItem[];
    onQuickReply: (quickReply: QuickReplyItem) => void;
    /**
     * Shen get message from GPT, we can use this function to detect it and transfer to 
     * another messsage type
     * @param message 
     * @returns 
     */
    transfer?: (message: IChatMessage) => Promise<IChatMessage>;
    /**
     * From agent part, once sent message to user ,exec this function
     * if gpt sent message, we can use this function get that message
     * @param input 
     * @returns 
     */
    onSend?: (input: IChatMessage) => void;
    /**
     * From agent part, once user sent message, agent will receive message, exec this funcion
     * agent can receive message ,then sent user message
     * if define this function , the response will make in this function, so will not call GPT.
     * if don't define this function, will call GPT to handle user message
     * @param message 
     * @returns 
     */
    onReceive?: (message: IChatMessage, options?: IChatOptions) => Promise<any>;
    /**
     * Excute on Plugin is loaded first
     * @returns 
     */
    onLoad?: () => void;
    shortTermMemory: IMessageBody[];
    memory: IMessageBody[];
    sendTaskSuccessMsg: (result: string, from: IChatMessage['from']) => void;
    /**
     * Set file  agent can accept
     */
    fileConfig?: {
        accept?: FileAccept,
        maxSize?: number,
        maxFiles?: number,
        multiple?: boolean,
    };
    render?: () => React.ReactNode;
    /**
     * Stop chat 
     */
    stop: () => void;
    /**
     * Render message context
     * @returns
     * React.ReactNode
     */
    renderMessageContext?: (context: string) => React.ReactNode;
    [x: string]: any;
}

export abstract class ChatPluginBase implements IChatPlugin {
    constructor(...mixins: any[]) {
        // 将传入的mixins应用到当前实例
        this.applyMixins(this, mixins);
    }
    private applyMixins(derivedCtor: any, baseCtors: any[]) {
        baseCtors.forEach(baseCtor => {
            Object.getOwnPropertyNames(baseCtor).forEach(name => {
                if (name !== 'constructor') {
                    // const descriptor = Object.getOwnPropertyDescriptor(baseCtor, name);
                    // if (descriptor) {
                    //     Object.defineProperty(derivedCtor, name, descriptor);
                    // }
                    derivedCtor[name] = baseCtor[name];
                }
            });
        });
    }
    context: ChatState;
    id?: string;
    // models?: GptModel[] = [LlmModel.GPT3_5_TURBO, LlmModel.GPT4]
    docType?: DocType;
    mode = 'chat';
    isCustom = false;
    icon: string | React.ReactElement | any;
    action: string;
    shortDescription: string;
    description: string;
    instruction = '';
    parameters?: { type: string; properties: any; };
    placeholder?: string;
    introduce: string | (() => ReactNode);
    model: IModelConfig = {
        temperature: 0.7
    };
    name: string;
    config: IModelConfig = {
        temperature: 0.7
    };
    quickReplies = () => [] as QuickReplyItem[];
    onQuickReply: (quickReply: QuickReplyItem) => void;
    onSend?: (input: IChatMessage) => void;
    onLoad?: () => void;
    transfer?: (message: IChatMessage) => Promise<IChatMessage>;
    shortTermMemory: IMessageBody[] = [];
    memory: IMessageBody[] = [];
    push = (message: IMessageBody) => {
        this.memory.push(message);
        if (process.env.NODE_ENV === 'development') {
            console.log(this.action, this.memory);
        }
    };
    tools: string[] = [];
    agents: string[] = [];
    injectContext: () => Promise<string>;
    buildChatMessage(content: string | React.ReactNode, type: ChatMessageType = 'text', to?: string, role?: Role, alt?: string): IChatMessage {
        // let msgContent = content;

        let text = '', files: File[] = [], card;

        if (type === 'parts') {
            text = (content as any).text;
            files = (content as any).fileList;
        } else if (type === 'text') {
            text = content as string;
        } else if (type === 'file') {
            files = content as File[];
            text = alt;
        } else if (type === 'card') {
            card = content as React.ReactNode;
            text = alt;
        }
        let msgContent = text;
        if (to && type === 'text') {
            msgContent = `@${to}\n${text}`;
        }
        return {
            _id: uuid(),
            type,
            content: msgContent,
            position: role == 'user' ? 'right' : 'left',
            role: role || 'assistant',
            to: to || '',
            mentions: [to] || [],
            card,
            files,
            text,
            from: {
                icon: this.icon,
                avatar: this.icon,
                name: this.name
            }
        };
    }
    async sendMsg(message: IChatMessage) {
        await this.context.sendMsg(message);
    }
    async sendTaskSuccessMsg(result: string, to: IChatMessage['from']) {

        if (!result) {
            await this.sendMsg(this.buildChatMessage(`Task completed.`, 'text', to?.name));
        } else {
            await this.sendMsg(this.buildChatMessage(result, 'text', to?.name));
        }
        this.context.setTyping(false);
    }
    failedMessage(reason: string, to: IChatMessage['from']) {
        return this.buildChatMessage(`Task executed failed, reason: ${reason}`, 'text', to?.name);
    }
    modelConfig: IModelConfig = null;
    /**
     * use this function to send context message and system message to LLM
     * @param instrunction system message, if not set use plugin model config
     * @param tools function call setting
     */
    async chat(input = '', instrunction = '', tools: ToolFunction[] = void 0) {
        const prompt = instrunction || this.instruction;
        // let temperature = 0.7;
        const config = this.model || { temperature: 0.7 };
        const temperature = typeof config.temperature === 'undefined' ? 0.7 : config.temperature;
        const context = [{ role: 'system', content: prompt }] as IMessageBody[];

        this.push({
            role: 'user',
            content: input
        });
        const result = await this.context.chat({
            messages: context.concat(this.memory),
            temperature,
            tools
        });
        if (result.content) {
            this.push({
                role: 'assistant',
                content: result.content
            });
        }
        return result;
    }
    getTools = () => {
        const { docType, agentTools, plugin } = this.context;
        // console.log('agentTools', agentTools)
        // const agentToolKey = `${docType}_${AGENT_TOOL}_${this.action}`;
        const tools = this.tools;
        // const agentTools: IAgentToolItem[] = getLocalStore(agentToolKey)
        if (plugin.action != this.action) {
            return (tools.map((name) => {
                return {
                    id: name,
                    name: snakeToWords(name),
                    enable: true
                };
            }));
        } else if (!agentTools) {
            return (tools.map((name) => {
                return {
                    id: name,
                    name: snakeToWords(name),
                    enable: true
                };
            }));
        } else {
            const newList = agentTools.filter(p => p.enable).map((tool) => {
                return {
                    id: tool.id,
                    name: snakeToWords(tool.name),
                    enable: true
                };
            });
            return newList;
        }
    };
    getAgents = () => {
        const { docType, plugins } = this.context;
        const colAgentKey = `${docType}_${AGENT_AGENT}_${this.action}`;
        const agents = this.agents || [];
        const colAgents = getLocalStore(colAgentKey);
        if (!colAgents) {
            return (agents.map((name) => {
                const plg = plugins.find(p => p.action == name);
                return {
                    id: plg.action,
                    icon: plg.icon,
                    name: plg.name,
                    enable: true
                };
            }));
        }
        return colAgents;
    };
    buildAgentTools = memoize((colAgents: IAgentToolItem[]) => {
        const { plugins } = this.context;
        const enableAgentsMap: { [x: string]: boolean } = colAgents.filter(p => p.enable).reduce((acc, tool) => {
            return {
                ...acc,
                [tool.id]: true
            };
        }, {});
        const toolList = plugins.filter(p => enableAgentsMap[p.action]);
        const agents: ToolFunction[] = toolList.map((plg) => {
            return {
                type: 'function',
                function: {
                    name: plg.action,
                    description: plg.description,
                    parameters: {
                        "type": "object",
                        "properties": {
                            "content": {
                                "type": "string",
                                "description": 'task description',
                            },
                        },
                        "required": ['content']
                    }
                }
            };
        });
        const agentMap = toolList.reduce((acc, tool) => {
            if (tool.action) {
                acc[tool.action] = tool;
            }
            return acc;
        }, {} as Record<string, any>);
        return {
            agents,
            agentMap,
        };
    });
    buildTools = memoize((agentTools: IAgentToolItem[]) => {
        const { tools } = this.context;
        if (agentTools.length <= 0) {
            return {
                toolMap: {},
                tools: void 0,
            };
        }
        const enableToolMap: { [x: string]: boolean } = agentTools.filter(p => p.enable).reduce((acc, tool) => {
            return {
                ...acc,
                [tool.id]: true
            };
        }, {});
        const tarTools = tools.filter(p => enableToolMap[p.name]);
        const toolMap = tarTools.reduce((acc, tool) => {
            if (tool.name) {
                acc[tool.name] = tool.func;
            }
            return acc;
        }, {} as Record<string, any>);

        const toolList: ToolFunction[] = tarTools.map(({ name, description, parameters }) => {
            return {
                type: 'function',
                function: {
                    name,
                    description,
                    parameters
                },

            };
        });
        return {
            toolMap,
            tools: toolList && toolList.length == 0 ? undefined : toolList
        };
    });
    buildAllTools = () => {
        const agentTools: IAgentToolItem[] = this.getTools();
        // console.log(agentTools)
        // const colAgents: IAgentToolItem[] = this.getAgents();
        // const { agentTools, colAgents } = this.context;
        // debugger;
        const { toolMap = {}, tools = [] } = this.buildTools(agentTools);
        // const { agentMap = {}, agents = [] } = this.buildAgentTools(colAgents);
        return {
            tools: tools,
            toolMap: {
                ...toolMap,
            }
        };
    };
    handleTools = async (tool_call: ToolFunctinCall, toolMap: any, message: any, dataContext: any) => {
        const { appendMsg, model, showMessage } = this.context;
        // console.log('tool_call.function.arguments', tool_call.function.arguments)
        let args = JSON.parse(tool_call.function.arguments);
        if (model.startsWith('glm')) {
            args = adaptToolArguments(args);
        }
        const name = tool_call.function.name;
        const displayName = i18n.t(name, snakeToWords(name), {
            ns: 'tool'
        });

        const toolMsg = showMessage(displayName);
        await sleep(100);
        try {
            const res = await toolMap[name]({
                ...args,
                from: {
                    name: this.action,
                    icon: this.icon
                },
                message,
                context: this.context,
                dataContext
            });
            if (res && res.type == 'card') {
                appendMsg(res);
                // deleteMsg(msg._id);
            } else {
                toolMsg.succeeded(displayName);
            }

            return res;
        } catch (e) {
            console.error(e);
            toolMsg.failed(`${displayName}:\n ${e.message}`);
            return `${name} tool failed to handle your request:` + e.message;
        }
    };
    handleAgents = async (message: IChatMessage, tool_call: ToolFunctinCall, agentMap: any,) => {
        const { text } = message;
        const { appendMsg } = this.context;

        const name = tool_call.function.name;
        const content = text; //JSON.parse(tool_call.function.arguments)?.content || text;

        // const agent = plugins.find(p => p.action == name);
        const agent: IChatPlugin = agentMap[name];

        appendMsg(this.buildChatMessage(content, 'text', agent.action, 'assistant',));

        let nextMessage = this.buildChatMessage(content, 'text', agent.action, 'assistant',);
        if (message.type == 'parts') {
            nextMessage = this.buildChatMessage({ text: content, fileList: message.files } as any, 'parts', agent.action, 'assistant',);
        }
        const agentReply: any = await agent.onReceive(nextMessage);
        // debugger;
        // console.log(agent.action, agentReply)
        if (agentReply) {
            // appendMsg(agentReply);
            return agentReply;
        }
        return null;
    };
    summaryHistory = async (memory: IMessageBody[]): Promise<IMessageBody[]> => {
        const summaryPrompt = `You can help me summarize messages, be concise and don't leave out information.`;
        const result = await this.context.chat(
            {
                messages: [{ role: 'system', content: summaryPrompt },
                ...memory,
                { role: 'user', content: 'Please summarize the conversation.' }
                ]
            });
        return [
            {
                role: 'assistant', content: `\n[History]\n${result.content}`
            },
        ];
    };
    handleToolCall = async (message: IChatMessage, response: IChatResult, toolMap: any, dataContext: string) => {
        const { tool_calls } = response;
        this.push({ role: 'assistant', content: response.content, tool_calls: tool_calls });

        for (let i = 0; i < tool_calls.length; i++) {
            const tool_call = tool_calls[i];
            const name = tool_call.function.name;
            try {
                let res;
                if (typeof toolMap[name] === 'function') {
                    res = await this.handleTools(tool_call, toolMap, message, dataContext);
                }
                if (!res) {
                    this.push({
                        "tool_call_id": tool_call.id,
                        "role": "tool",
                        "name": name,
                        "content": `${name} tool failed to handle your request`
                    });
                    continue;
                }
                if (typeof res === 'string') {
                    this.push({
                        "tool_call_id": tool_call.id,
                        "role": "tool",
                        "name": name,
                        "content": res,
                    });
                } else if (typeof res == 'object' && typeof res.content === 'string') {
                    this.push({
                        "tool_call_id": tool_call.id,
                        "role": "tool",
                        "name": name,
                        "content": res.content
                    });
                } else {
                    this.push({
                        "tool_call_id": tool_call.id,
                        "role": "tool",
                        "name": name,
                        "content": JSON.stringify(res),
                    });
                }

            } catch (e) {
                this.push({
                    "tool_call_id": tool_call.id,
                    "role": "tool",
                    "name": name,
                    "content": 'Task execution failure:' + e.message,
                });
            }

        }
    };
    handleAgentCall = async (message: IChatMessage, response: IChatResult, toolMap: any): Promise<any> => {
        const { tool_calls } = response;
        // this.push({ role: 'assistant', content: response.content, tool_calls: tool_calls })
        for (let i = 0; i < tool_calls.length; i++) {
            const tool_call = tool_calls[i];
            const name = tool_call.function.name;
            try {
                let res;
                if (typeof toolMap[name] === 'object') {
                    res = await this.handleAgents(message, tool_call, toolMap);
                }
                if (!res) {
                    return;
                }
                if (typeof res === 'string') {
                    this.push({
                        "role": 'assistant',
                        "content": res,
                    });
                } else if (typeof res == 'object' && typeof res.type === 'string') {
                    this.push({
                        "role": 'assistant',
                        "content": res.content
                    });
                } else {
                    this.push({
                        "role": 'assistant',
                        "content": JSON.stringify(res),
                    });
                }

            } catch (e) {
                this.push({
                    "role": 'assistant',
                    "content": 'Task execution failure',
                });
            }

        }
    };
    // convertMessageToMark = async (message: IChatMessage): Promise<IChatMessage> => {
    //     if (message.type == 'text') {
    //         return message;
    //     }
    //     if (message.type === 'file') {

    //     }
    //     if (message.type === 'image') {

    //     }
    //     if (message.type === 'parts') {

    //     }
    // }
    conversationId = uuid();
    abort: () => void = null;
    stop = () => {
        if (this.abort) {
            this.abort();
        }
    };
    renderMessageContext = (context: string) => {
        return (
            <ContextText text={context} />
        );
    };
    // handleCall = async (message: IChatMessage, result: IChatResult, toolMap: any, dataContext: string) => {
    //     const toolCalls = result.tool_calls.filter(p => this.tools.includes(p.function.name));
    //     if (toolCalls && toolCalls.length > 0) {
    //         await this.handleToolCall(message, result, toolMap, dataContext);
    //     }
    //     const agentCalls = result.tool_calls.filter(p => this.agents.includes(p.function.name));
    //     if (agentCalls && agentCalls.length > 0) {
    //         return await this.handleAgentCall(message, result, toolMap, dataContext);
    //     }
    // }
    async onReceive(message: IChatMessage, options: IChatOptions = { stream: true }) {

        const { setTyping, setStatus, platform, model, plugin, plugins, user, chat, appendMsg, updateMsg } = this.context;
        setTyping(true);
        setStatus('typing');

        if (message.mentions && message.mentions.length > 0) {
            // let other agent do this work
            const mentions = message.mentions;
            let allMsg = '';
            this.push({
                role: 'user',
                content: message.context ? message.context + '\n\n' + message.content : message.content
            });
            for (let i = 0; i < mentions.length; i++) {
                const agentName = mentions[i];
                if (agentName === plugin.action) {
                    continue;
                }
                const agent = plugins.find(p => p.action.toLowerCase() === agentName.toLowerCase());
                if (!agent) {
                    continue;
                }

                const msg = await agent.onReceive({
                    ...message,
                    mentions: []
                });
                // appendMsg(msg);
                if (!msg) {
                    continue;
                }
                allMsg += removeMentions(msg.content) + '\n';
            }
            if (allMsg) {
                this.push({
                    role: 'assistant',
                    content: allMsg
                });
            }
            return;
        }
        if (message.mentions && message.mentions.length == 0) {
            if (message.type == 'parts') {
                if (message.files.some(p => p.name.includes('png') || p.name.includes('jpg') || p.name.includes('jpeg'))) {
                    if (this.action !== 'vision') {
                        const agent = plugins.find(p => p.action === 'vision');
                        if (agent) {
                            this.push({
                                role: 'user',
                                content: message.context ? message.context + '\n\n' + message.content : message.content
                            });
                            appendMsg(this.buildChatMessage(`@Vision ${message.content}`, 'text', '', 'assistant'));
                            const msg = await agent.onReceive(message);
                            if (msg && msg.content) {
                                this.push({
                                    role: 'assistant',
                                    content: msg.content
                                });
                            }
                            return msg;
                        }
                    }
                } else if (message.files.some(p => p.name.includes('xls') || p.name.includes('xlsx'))) {
                    if (this.action !== 'python') {
                        const agent = plugins.find(p => p.action === 'python');
                        if (agent) {
                            this.push({
                                role: 'user',
                                content: message.context ? message.context + '\n\n' + message.content : message.content
                            });
                            appendMsg(this.buildChatMessage(`@Python ${message.content}`, 'text', '', 'assistant'));
                            const msg = await agent.onReceive(message);
                            if (msg && msg.content) {
                                this.push({
                                    role: 'assistant',
                                    content: msg.content
                                });
                            }
                            return msg;
                        }
                    }
                }
            }
        }
        const { tools, toolMap } = this.buildAllTools();
        const tarModel = options.model || model;

        if (!IsSupportToolCallModel(tarModel) && tools.length > 0) {
            // if (tarModel.toLowerCase().indexOf('deepseek') >= 0) {
            //     return await this.handleByReactForDeepseek(message, options);
            // }
            return await this.handleByReact(message, options);
        }

        let instruction = this.instruction;
        let dataContext = '';
        if (this.injectContext) {
            const additionalContext = await this.injectContext();
            instruction = `${this.instruction}\n\n${additionalContext}`;
            dataContext = additionalContext;
        }

        const context: IMessageBody[] = [{
            role: 'system',
            content: instruction
        }];

        if (this.memory.length > 20) {
            this.memory = await this.summaryHistory(this.memory);
        }

        this.push({
            role: 'user',
            content: message.context ? message.context + '\n\n' + message.content : message.content
        });

        // const msgs: any = this.buildContextMessage(message.content);
        let resMsg = this.buildChatMessage('', 'text');
        let isAppend = false;

        let loopCount = 5;
        let isStream = false;
        // if api dos not support stream,use this var to know if it is stream
        try {
            while (--loopCount > 0) {
                if (this.context.mute) {
                    break;
                }
                setTyping(true);
                setStatus('typing');
                const messages = context.concat(this.memory);
                const stream: boolean = options.stream;
                const tarTools = options.tools || tools;
                const tarModel = options.model || model;
                const result = await chat({
                    agent: this.action,
                    messages,
                    temperature: 0.7,
                    model: tarModel,
                    // functions,
                    tools: tarTools,
                    stream: stream
                }, async (done: boolean, res: IChatResult, abort) => {
                    this.abort = abort;
                    isStream = true;
                    if (!res.content) {
                        return;
                    }
                    if (res.content) {
                        if (!isAppend) {
                            setStatus('processing');
                            resMsg.content = res.content;
                            appendMsg(resMsg);
                            isAppend = true;
                        } else {
                            resMsg.content = res.content;
                            updateMsg(resMsg._id, resMsg);
                        }
                    }
                    if (done) {
                        setStatus('done');
                        if (res.content) {
                            // this.push({
                            //     role: 'assistant',
                            //     content: res.content
                            // })
                            resMsg.content = res.content;
                            updateMsg(resMsg._id, resMsg);
                        }
                        isAppend = false;
                        resMsg = this.buildChatMessage('', 'text');
                    }
                });
                setStatus('processing');
                if (!result) {
                    break;
                } else if (typeof result === 'string') {
                    if ((result as string).startsWith("{")) {
                        this.push({ role: 'assistant', content: result });
                        return this.buildChatMessage(result);
                    }
                    break;
                }

                if (result.content && (result.tool_calls && result.tool_calls.length > 0)) {
                    // this.push({ role: 'assistant', content: result.content })
                    if (!isStream) {
                        // this.push({ role: 'assistant', content: result.content })
                        appendMsg(this.buildChatMessage(result.content));
                    }
                    const toolCalls = result.tool_calls.filter(p => this.tools.includes(p.function.name));
                    if (toolCalls && toolCalls.length > 0) {
                        await this.handleToolCall(message, { ...result, tool_calls: toolCalls }, toolMap, dataContext);
                    }
                    const agentCalls = result.tool_calls.filter(p => this.agents.includes(p.function.name));
                    if (agentCalls && agentCalls.length > 0) {
                        return await this.handleAgentCall(message, { ...result, tool_calls: agentCalls }, toolMap);
                    }
                } else if (result.content) {
                    this.push({ role: 'assistant', content: result.content });

                    if (!isStream) {
                        // this.push({ role: 'assistant', content: result.content });
                        const msg = this.buildChatMessage(result.content);
                        appendMsg(msg);
                        return msg;
                    } else {
                        return this.buildChatMessage(result.content);
                    }
                } else if (result.tool_calls && result.tool_calls.length > 0) {
                    const toolCalls = result.tool_calls.filter(p => this.tools.includes(p.function.name));
                    if (toolCalls && toolCalls.length > 0) {
                        await this.handleToolCall(message, { ...result, tool_calls: toolCalls }, toolMap, dataContext);
                    }
                    const agentCalls = result.tool_calls.filter(p => this.agents.includes(p.function.name));
                    if (agentCalls && agentCalls.length > 0) {
                        return await this.handleAgentCall(message, { ...result, tool_calls: agentCalls }, toolMap);
                    }
                } else {
                    break;
                }
            }
        }
        finally {
            setTyping(false);
            setStatus('done');
        }
    }

    async callTool(message: IChatMessage, toolName: string, callback: (content: string) => void, options = { stream: true }) {
        const { model, chat, user, platform } = this.context;

        let instruction = this.instruction;
        let dataContext = this.context.dataContext;
        if (dataContext) {
            instruction = `${this.instruction}\n\n${dataContext}`;
        } else if (this.injectContext) {
            const additionalContext = await this.injectContext();
            instruction = `${this.instruction}\n\n${additionalContext}`;
            dataContext = additionalContext;
        }

        const context: IMessageBody[] = [{
            role: 'system',
            content: instruction
        }];

        // const msgs: any = this.buildContextMessage(message.content);
        const { tools, toolMap } = this.buildAllTools();
        let isAppend = false;
        const stream = options.stream;
        let isStream = false;
        const result = await chat({
            agent: this.action,
            messages: context.concat([{
                role: 'user',
                content: message.content
            }]),
            temperature: 0.7,
            // functions,
            tools: tools.filter(p => p.function.name == toolName),
            stream
        }, async (done: boolean, res: IChatResult, abort) => {
            this.abort = abort;
            isStream = true;
            if (!res.content) {
                return;
            }
            if (res.content) {
                if (!isAppend) {
                    callback?.(res.content);
                    isAppend = true;
                } else {
                    callback?.(res.content);
                }
            }
            if (done) {
                if (res.content) {
                    callback?.(res.content);
                }
                isAppend = false;
            }
        });
        if (!result) {
            return;
        } else if (typeof result === 'string') {
            if ((result as string).startsWith("{")) {
                return this.buildChatMessage(result);
            }
            return;
        }

        if (result.content) {
            callback?.(result.content);
        }

        if (result.tool_calls && result.tool_calls.length > 0) {
            const toolCalls = result.tool_calls;
            const tool_call = toolCalls[0];
            const name = tool_call.function.name;
            try {
                let res;
                if (typeof toolMap[name] === 'function') {
                    // res = await this.handleTools(tool_call, toolMap, message, dataContext)
                    let args = JSON.parse(tool_call.function.arguments);
                    if (model.startsWith('glm')) {
                        args = adaptToolArguments(args);
                    }
                    res = await toolMap[name]({
                        ...args,
                        from: {
                            name: this.action,
                            icon: this.icon
                        },
                        message,
                        context: this.context,
                        dataContext
                    });
                }
                if (!res) {
                    return `${name} tool failed to handle your request`;
                }
                if (typeof res === 'string') {
                    return res;
                } else if (typeof res == 'object' && typeof res.content === 'string') {
                    return res.content;
                } else {
                    return JSON.stringify(res);
                }
            } catch (e) {
                return e.message;
            }
        }
    }
    async fixJsonFormat(jsonData: string) {
        const { chat } = this.context;
        const prompt = `Extract json and Fix json format error,only return json,don't wrap it in \`\`\`.":\n\n${jsonData}`;
        const messages: any[] = [{
            role: 'user',
            content: prompt
        }];
        const result = await chat(
            { messages, temperature: 0.5, stream: true },
            async (done: boolean, res: IChatResult, abort) => {
                this.abort = abort;
            }
        );
        return result.content;
    }
    async handleByReact(message: IChatMessage, options: IChatOptions = { stream: true }) {
        const { setTyping, setStatus, platform, model, plugin, plugins, user, chat, appendMsg, updateMsg } = this.context;
        setTyping(true);
        setStatus('typing');
        const { tools, toolMap } = this.buildAllTools();
        let instruction = this.instruction;
        let dataContext = '';
        if (this.injectContext) {
            const additionalContext = await this.injectContext();
            instruction = `${this.instruction}\n\n${additionalContext}`;
            dataContext = additionalContext;
        }
        const context: IMessageBody[] = [{
            role: 'system',
            content: instruction
        }];
        const tarModel = options.model || model;

        this.push({
            role: 'user',
            content: `<user_input>\n\n${message.context ? message.context + '\n\n' + message.content : message.content}\n\n</user_input>`
        });

        // const isDeepseek = tarModel.toLowerCase().indexOf('deepseek') >= 0;
        const taskPrompt = taskExecListPrompt;
        let resMsg = this.buildChatMessage('', 'text');
        let isAppend = false;

        let loopCount = 3;
        try {
            while (loopCount-- > 0) {
                if (this.context.mute) {
                    break;
                }
                setTyping(true);
                setStatus('typing');

                const tool_status = this.memory.filter(p => p.role == 'tool').map((task) => {
                    return `tool ${task.tool_call_id}, status:done`;
                }).join('\n');

                const prompt = template(taskPrompt, {
                    tool_status: tool_status || 'None',
                    tools: JSON.stringify(tools, null, 2)
                });

                const hisotry: IMessageBody[] = this.memory.map((msg) => {
                    if (msg.role === 'assistant' && msg?.tool_calls?.length > 0) {
                        return {
                            role: 'assistant',
                            content: `${msg.content}\n\n\`\`\`tools\n${JSON.stringify(msg?.tool_calls, null, 2)}\n\`\`\``
                        };
                    }
                    if (msg.role == 'tool') {
                        return {
                            role: 'user',
                            // name: msg.name,
                            content: `Call tool ${msg.name} ${msg.tool_call_id} result:\n\n${msg.content}.`
                        };
                    }

                    return msg;
                }).concat([
                    {
                        role: 'user',
                        content: prompt
                    }
                ]).reduce((prev, cur) => {
                    // merge user role
                    if (cur.role === 'user' && prev[prev.length - 1]?.role === 'user') {
                        // copy content,do not update origin
                        prev[prev.length - 1].content = prev[prev.length - 1].content + '\n\n' + cur.content;
                        // prev.push({
                        //     ...prev[prev.length - 1],
                        //     content: prev[prev.length - 1].content + '\n\n' + cur.content
                        // })
                    } else {
                        prev.push({
                            ...cur
                        });
                    }
                    return prev;
                }, []);
                console.log('memory');
                console.log(this.memory);
                console.log('hisotry');
                console.log(hisotry);
                const messages = context
                    .concat(hisotry);
                // console.log(messages)
                const result = await chat({
                    messages,
                    temperature: 0.7,
                    model: tarModel,
                    stream: true
                }, async (done: boolean, res: IChatResult, abort) => {
                    this.abort = abort;
                    if (!res.content) {
                        return;
                    }

                    if (res.content) {
                        if (!isAppend) {
                            setStatus('processing');
                            resMsg.content = res.content;
                            appendMsg(resMsg);
                            isAppend = true;
                        } else {
                            resMsg.content = res.content;
                            updateMsg(resMsg._id, resMsg);
                        }
                    }
                    if (done) {
                        setStatus('done');
                        if (res.content) {
                            resMsg.content = res.content;
                            updateMsg(resMsg._id, resMsg);
                        }
                        isAppend = false;
                        resMsg = this.buildChatMessage('', 'text');
                    }
                });
                setTyping(true);
                const content = result.content;
                // console.log(content)
                let res = extractJsonDataFromMd(content);
                if ((content.includes('```tools') || content.includes('```json')) && !res.tools) {
                    const json = await this.fixJsonFormat(content);
                    // console.log('fix json')
                    // console.log(json)
                    res = extractJsonDataFromMd(json);
                }
                // console.log(res)
                if ((res.tools && res.tools.length > 0)) {
                    const tool_calls: ToolFunctinCall[] = res.tools.map((tool: any) => {
                        return {
                            id: tool.id,
                            type: 'function',
                            function: {
                                name: tool.function.name,
                                arguments: JSON.stringify(tool.function.parameters || tool.function.arguments)
                            }
                        };

                    });
                    const toolCalls = tool_calls.filter(p => this.tools.includes(p.function.name));
                    // console.log('toolCalls')
                    // console.log(toolCalls)
                    if (toolCalls && toolCalls.length > 0) {
                        await this.handleToolCall(message, { ...result, tool_calls: toolCalls }, toolMap, dataContext);
                    }

                } else {
                    this.push({
                        role: 'assistant',
                        content: result.content
                    });
                    break;
                }
            }
        } catch (e) {
            console.error(e);
            setTyping(false);
            setStatus('done');
        } finally {
            setTyping(false);
            setStatus('done');
        }
    }
}

export interface IAgentToolItem { id: string, name: string, icon?: string, enable: boolean }

export interface IAgentTools {
    agentTools: IAgentToolItem[];
    colAgents: IAgentToolItem[];
    setAgentTool: (name: string, enable: boolean) => void;
    setColAgent: (name: string, enable: boolean) => void;
    setAgentTools: (list: IAgentToolItem[]) => void;
    setColAgents: (list: IAgentToolItem[]) => void;
    reset: () => void;
}

export type IChatStatus = 'typing' | 'processing' | 'done';
export type IPreview = { title: string, component: React.ReactNode, className?: string };

export type ChatState = {
    platform: Platform;
    text: string;
    loading: boolean;
    typing: boolean;
    plugins: IChatPlugin[];
    setPlugins?: (plugins: IChatPlugin[]) => void;
    plugin: IChatPlugin;
    setPlugin?: (plugin: IChatPlugin) => void;
    messages: IChatMessage[];
    replies: QuickReplyItem[];
    quickReply: (item: QuickReplyItem, index: number) => void;
    appendMsg: (message: IChatMessage) => void;
    deleteMsg: (id: string) => void;
    resetList: (message?: IChatMessage[]) => void;
    setTyping: (typing: boolean) => void;
    prependMsgs: (messages: IChatMessage[]) => void;
    updateMsg: (messageId: string, messages: ChatMessageWithoutId) => void;
    sendMsg: (message: IChatMessage) => void;
    setText: (content: string) => void;
    chat: (body: IChatBody, callback?: (done: boolean, result: IChatResult, stop: () => void) => void) => Promise<IChatResult>;
    completions?: (body: ICompletionsBody) => Promise<string>;
    placeholder?: string;
    setPlaceholder?: (placeholder: string) => void;
    user: IUserState;
    docType?: DocType;
    mode: { [x: string]: ModeType };
    setMode?: (agent: string, mode: ModeType) => void;
    mute?: boolean;
    setMute?: (mute?: boolean) => void;
    model?: GptModel,
    setModel?: (model: GptModel) => void;
    provider?: string,
    setProvider?: (provider: string) => void;
    dataContext?: string;
    setDataContext?: (dataContext: string) => void;
    dataAsContext: boolean;
    setDataAsContext?: (dataAsContext: boolean) => void;
    tools: ITool[];
    agentTools: IAgentToolItem[];
    colAgents: IAgentToolItem[];
    setAgentTool: (name: string, enable: boolean) => void;
    setColAgent: (name: string, enable: boolean) => void;
    setAgentTools: (list: IAgentToolItem[]) => void;
    setColAgents: (list: IAgentToolItem[]) => void;
    newChat?: () => void;
    status?: IChatStatus;
    setStatus?: (status: IChatStatus) => void;
    showMessage?: (message: string | React.ReactNode, role?: 'tool' | 'assistant', type?: ChatMessageType) => ({
        delete?: () => void,
        update?: (message: string | React.ReactNode) => void,
        succeeded?: (message: string) => void,
        failed?: (error: string) => void
    });
    fileList?: File[];
    setFileList?: (fileList: File[]) => void;
    preview?: IPreview;
    setPreview?: (preview: IPreview) => void;
    loadAgents?: () => Promise<void>;
};

