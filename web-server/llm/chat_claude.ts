
import { OPENROUTER_API_KEY, OPENROUTER_BASE_URL } from "@/constants/llm";
import { buildMessageForTool, buildMessageForUser, buildMessageForStream, removeToolForMessage } from "@/service/intend";
import { IChatRequest, Message } from "@/types/chat";
import { extractJsonDataFromMd } from "@/utils";

import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: OPENROUTER_API_KEY,
    baseURL: OPENROUTER_BASE_URL
});

// const modelMap = {
//     'https://api.deepseek.com': 'deepseek-chat',
//     'https://api.siliconflow.cn/v1': 'deepseek-ai/DeepSeek-V2-Chat'
// }

// const modelName = modelMap[DEEPSEEK_BASE_URL];

export async function chat({ messages, model, ...rest }: IChatRequest) {
    const result = await openai.chat.completions.create({
        model,
        messages,
        ...rest
    } as any);
    if (result.choices.length > 0) {
        const message = result.choices[0].message;
        const usage = result.usage;
        const {
            role,
            content,
            tool_calls
        } = message;
        return {
            role,
            content,
            tool_calls,
            usage
        }
    }
}


export async function chatProxy({ messages, tools = [], model, ...rest }: IChatRequest) {

    let tarMessages = messages;
    let lastMessage = messages[messages.length - 1];
    if (tools.length > 0) {
        if (lastMessage.role == 'user') {
            tarMessages = buildMessageForUser(messages, tools);
            const result = await openai.chat.completions.create({
                model,
                messages: tarMessages,
                ...rest
            } as any) as any;

            if (result?.error?.message) {
                return {
                    error: {
                        message: result.error?.message
                    }
                }
            }

            if (result.choices.length > 0) {
                console.log(JSON.stringify(result, null, 2))
                const response = result.choices[0].message.content;
                console.log('response', response)
                let res;
                try {
                    res = extractJsonDataFromMd(response);
                } catch (e) {
                    console.log('json error')
                    const json = await fixJsonFormat(response)
                    console.log('json fix')
                    console.log(json)
                    res = extractJsonDataFromMd(json);
                }
                if (!res.function) {
                    if (res.type == 'chat' || res.content) {
                        return {
                            choices: [
                                {
                                    message: {
                                        content: res.content,
                                        tool_calls: [],
                                    }
                                }
                            ],
                            usage: result.usage
                        }
                    } else {
                        throw new Error('handle request error');
                    }
                }
                if (res.function.name == 'chat') {
                    return {
                        choices: [
                            {
                                message: {
                                    content: res.function.parameters.response,
                                    tool_calls: [],
                                }
                            }
                        ],
                        usage: result.usage
                    }
                } else {
                    if (res?.function?.parameters?.type === 'object' && res?.function?.parameters?.properties) {
                        throw new Error('Parameters generate error');
                    }
                    return {
                        choices: [
                            {
                                message: {
                                    content: '',
                                    tool_calls: [{
                                        function: {
                                            name: res.function.name,
                                            arguments: JSON.stringify(res.function.parameters || res.function.arguments)
                                        }
                                    }],
                                }
                            }
                        ],
                        usage: result.usage
                    }
                }
            }

            return {
                choices: [
                    {
                        message: {
                            content: '',
                            tool_calls: [],
                        }
                    }
                ],
                usage: {
                    completion_tokens: 0,
                    prompt_tokens: 0,
                    total_tokens: 0,
                }
            }


        } else if (lastMessage.role == 'tool') {
            tarMessages = buildMessageForTool(messages, tools);
            const result = await openai.chat.completions.create({
                model,
                messages: tarMessages,
                ...rest
            } as any) as any;

            if (result?.error?.message) {
                return {
                    error: {
                        message: result.error?.message
                    }
                }
            }

            if (result.choices.length > 0) {
                const response = result.choices[0].message.content;
                return {
                    choices: [
                        {
                            message: {
                                content: response,
                                tool_calls: [],
                            }
                        }
                    ],
                    usage: result.usage
                }

            }

            return {
                choices: [
                    {
                        message: {
                            content: '',
                            tool_calls: [],
                        }
                    }
                ],
                usage: {
                    completion_tokens: 0,
                    prompt_tokens: 0,
                    total_tokens: 0,
                }
            }

        }

    } else {
        tarMessages = removeToolForMessage(messages);

        const result = await openai.chat.completions.create({
            model,
            messages: tarMessages,
            ...rest
        } as any) as any;

        if (result?.error?.message) {
            return {
                error: {
                    message: result.error?.message
                }
            }
        }
        if (result.choices.length > 0) {
            return result;
        }
        return {
            choices: [
                {
                    message: {
                        content: '',
                        tool_calls: [],
                    }
                }
            ],
            usage: {
                completion_tokens: 0,
                prompt_tokens: 0,
                total_tokens: 0,
            }
        }

    }

}


export async function chatStreamProxy({ messages, model, tools, ...rest }: IChatRequest, callback?: (tokenNumber: number) => void) {
    const tarMessages = buildMessageForStream(messages, tools);
    const events = await openai.chat.completions.create({
        model,
        messages: tarMessages,
        ...rest,
        stream: true,
    } as any) as any;

    // for await (const chunk of events) {
    //     console.log(chunk.choices[0].delta.content);
    // }

    const textEncoder = new TextEncoder();
    const response = {
        content: '',
        tool_calls: []
    }
    const stream = new ReadableStream({
        async start(controller) {
            let useage;
            for await (const event of events) {
                // console.log(event.usage)
                controller.enqueue(textEncoder.encode(`\n`));
                const choices = []
                for (const choice of event.choices) {
                    choices.push({
                        index: choice.index,
                        delta: choice.delta,
                        message: choice.message
                    })

                    const content = choice.delta?.content;
                    const toolCalls = choice.delta?.tool_calls;
                    if (content !== undefined && content != null) {
                        response.content += content;
                    }

                    if (toolCalls != undefined && toolCalls != null) {
                        response.tool_calls = mergeToolCalls(response.tool_calls, toolCalls);
                    }
                }
                const data = textEncoder.encode(`data:${JSON.stringify({
                    choices: choices,
                    usage: event.usage
                })}`);
                if (event.usage) {
                    useage = event.usage;
                }
                controller.enqueue(data);
                controller.enqueue(textEncoder.encode(`\n`));
            }

            controller.enqueue(textEncoder.encode(`\n`));
            const done = textEncoder.encode(`[DONE]`);
            controller.enqueue(done);
            controller.enqueue(textEncoder.encode(`\n`));
            controller.close();


            if (callback) {
                await callback(useage?.total_tokens);
            }
        },
    })
    return new Response(stream);
}


export const whisper = async (second) => {

}

function mergeToolCalls(toToolCalls, fromToolCalls) {
    fromToolCalls.forEach(fromToolCall => {
        const matchingIndex = toToolCalls.findIndex(toToolCall => toToolCall.index === fromToolCall.index);

        if (matchingIndex !== -1) {
            // 合并已存在的 toolCall
            const toToolCall = toToolCalls[matchingIndex];

            // 合并 function 对象的属性，例如 arguments 和 name
            Object.keys(fromToolCall.function).forEach(key => {
                toToolCall.function[key] += fromToolCall.function[key];
            });

            // 如果 fromToolCall 中有其他属性，也合并到 toToolCall 中
            Object.keys(fromToolCall).forEach(key => {
                if (key !== 'function') {
                    toToolCall[key] = fromToolCall[key];
                }
            });
        } else {
            // 如果不存在，则将整个 fromToolCall 添加到 toToolCalls 中
            toToolCalls.push(fromToolCall);
        }
    });

    return toToolCalls;
}

export const fixJsonFormat = async (jsonData: string) => {
    const prompt = `Extract json and Fix json format error:\n\n${jsonData}`;
    const messages: Message[] = [{
        role: 'user',
        content: prompt
    }]
    const result = await chat({ messages, model: 'openai/gpt-4o-mini', temperature: 0.5 });
    return result.content;
}