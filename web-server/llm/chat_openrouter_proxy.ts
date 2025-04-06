
import { LANGFUSE_HOST, LANGFUSE_PUBLIC_KEY, LANGFUSE_SECRET_KEY, OPENROUTER_API_KEY, OPENROUTER_BASE_URL } from "@/constants/llm";
import { IChatRequest } from "@/types/chat";
import { encodingForModel } from "js-tiktoken";
import { observeOpenAI } from "langfuse";
import { waitUntil } from "@vercel/functions";

import OpenAI from "openai";
import { sleep } from "openai/core";

const client = new OpenAI({
    apiKey: OPENROUTER_API_KEY,
    baseURL: OPENROUTER_BASE_URL,
    defaultHeaders: {
        "HTTP-Referer": "https://www.sally.bot",
        "X-Title": "Sally",
    }
});

export const modelMapping = {
    "gpt-4o-mini": "openai/gpt-4o-mini",
    "gpt-4o": "openai/gpt-4o-2024-11-20",
    "claude-3.5-sonnet": "anthropic/claude-3.5-sonnet",
    "claude-3.5-haiku": "anthropic/claude-3.5-haiku",
    "deepseek-chat": "deepseek-ai/DeepSeek-V3",
    "deepseek-reasoner": "deepseek-ai/DeepSeek-R1",
}

export async function chat({ messages, model: sourceModel, ...rest }: IChatRequest) {
    const model = (modelMapping[sourceModel] || sourceModel);

    const openai = observeOpenAI(client, {
        generationName: 'openrouter.' + model,
        clientInitParams: {
            secretKey: LANGFUSE_SECRET_KEY,
            publicKey: LANGFUSE_PUBLIC_KEY,
            baseUrl: LANGFUSE_HOST
        }
    });

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


export async function chatProxy({ messages, model, ...rest }: IChatRequest, openai?: OpenAI) {

    const result = await openai.chat.completions.create({
        model,
        messages,
        ...rest
    } as any) as any;

    if (result?.error?.message) {
        return {
            error: {
                message: result.error?.message
            }
        }
    }
    return result;
}

export interface TokenCount {
    inputTokens: number;
    outputTokens: number;
    totalTokens?: number;
}

export function calculateTokens(request: IChatRequest): {
    calculateOutput: (output: string) => TokenCount;
    inputTokens: number;
} {
    const encoder = encodingForModel('gpt-4o');

    let tokenCount = {
        inputTokens: 0,
        outputTokens: 0
    };

    // 处理messages
    for (const message of request.messages) {
        // 每条消息的基础token数
        tokenCount.inputTokens += 3;

        // 计算role的token
        tokenCount.inputTokens += encoder.encode(message.role).length;

        // 计算content的token
        if (message.content) {
            tokenCount.inputTokens += encoder.encode(message.content).length;
        }

        // 计算name的token（如果存在）
        if (message.name) {
            tokenCount.inputTokens += encoder.encode(message.name).length;
        }

        // 处理tool_calls相关的token
        if (message.tool_calls) {
            // 添加tool_calls标识符的token
            tokenCount.inputTokens += encoder.encode('tool_calls').length;

            for (const tool_call of message.tool_calls) {
                if (typeof tool_call === 'object') {
                    // 计算tool_call的所有属性的token
                    tokenCount.inputTokens += encoder.encode(JSON.stringify(tool_call)).length;
                }
            }
        }
    }

    // 处理functions（如果存在）
    if (request.functions) {
        tokenCount.inputTokens += encoder.encode('functions').length;
        for (const func of request.functions) {
            tokenCount.inputTokens += encoder.encode(JSON.stringify(func)).length;
        }
    }

    // 处理tools（如果存在）
    if (request.tools) {
        tokenCount.inputTokens += encoder.encode('tools').length;
        for (const tool of request.tools) {
            tokenCount.inputTokens += encoder.encode(JSON.stringify(tool)).length;
        }
    }

    // 处理response_format（如果存在）
    if (request.response_format) {
        tokenCount.inputTokens += encoder.encode(JSON.stringify(request.response_format)).length;
    }

    // 结束token
    tokenCount.inputTokens += 3;

    return {
        calculateOutput: (output: string) => {
            tokenCount.outputTokens = encoder.encode(output).length;

            return {
                inputTokens: tokenCount.inputTokens,
                outputTokens: tokenCount.outputTokens,
                totalTokens: tokenCount.inputTokens + tokenCount.outputTokens
            };
        },
        inputTokens: tokenCount.inputTokens
    };
}

export async function chatStreamProxy({ messages, model, ...rest }: IChatRequest, openai?: OpenAI) {
    try {

        // 计算输入token
        const tokenCounter = calculateTokens({ messages, model, ...rest });
        let outputContent = '';
        const events = await openai.chat.completions.create({
            model,
            messages,
            ...rest,
            stream: true,
        } as any) as any;

        const textEncoder = new TextEncoder();

        const stream = new ReadableStream({
            async start(controller) {
                let useage;
                for await (const event of events) {
                    // console.log(event.usage)
                    // console.log(event)
                    controller.enqueue(textEncoder.encode(`\n`));
                    const choices = []
                    for (const choice of event.choices) {
                        // 累积输出内容以计算token
                        if (choice.delta?.content) {
                            outputContent += choice.delta.content;
                        }
                        choices.push({
                            index: choice.index,
                            delta: choice.delta,
                            message: choice.message
                        });
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
            },
        })

        return new Response(stream);
    } catch (e) {
        const textEncoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                const data = textEncoder.encode(`data:${JSON.stringify({
                    choices: [{
                        index: 0,
                        delta: {
                            role: 'assistant',
                            content: e.message
                        },
                    }],
                })}`);
                controller.enqueue(data);
                controller.enqueue(textEncoder.encode(`\n`));
                const done = textEncoder.encode(`[DONE]`);
                controller.enqueue(done);
                controller.enqueue(textEncoder.encode(`\n`));
                controller.close();
            },
        })
        return new Response(stream);

        // return NextResponse.json({
        //     choices: [{
        //         delta: {
        //             content: ErrorInfo.TokenNotEnough
        //         }
        //     }]
        // })
    }
}


export const responseByStream = (message: string) => {
    const textEncoder = new TextEncoder();
    const stream = new ReadableStream({
        async start(controller) {
            const data = textEncoder.encode(`data:${JSON.stringify({
                choices: [{
                    index: 0,
                    delta: {
                        role: 'assistant',
                        content: message
                    },
                }],
            })}`);
            controller.enqueue(data);
            controller.enqueue(textEncoder.encode(`\n`));
            const done = textEncoder.encode(`[DONE]`);
            controller.enqueue(done);
            controller.enqueue(textEncoder.encode(`\n`));
            controller.close();
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