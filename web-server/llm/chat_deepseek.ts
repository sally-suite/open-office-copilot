
import { DEEPSEEK_API_KEY, DEEPSEEK_BASE_URL, LANGFUSE_HOST, LANGFUSE_PUBLIC_KEY, LANGFUSE_SECRET_KEY } from "@/constants/llm";
import { IChatRequest } from "@/types/chat";
import { observeOpenAI } from "langfuse";
import OpenAI from "openai";

// const openai = new OpenAI({
//     apiKey: DEEPSEEK_API_KEY,
//     baseURL: DEEPSEEK_BASE_URL
// });

const openai = observeOpenAI(new OpenAI({
    apiKey: DEEPSEEK_API_KEY,
    baseURL: DEEPSEEK_BASE_URL
}), {
    generationName: 'OpenAI.chat',
    clientInitParams: {
        secretKey: LANGFUSE_SECRET_KEY,
        publicKey: LANGFUSE_PUBLIC_KEY,
        baseUrl: LANGFUSE_HOST
    }
});

const model = 'deepseek-chat';

export async function chat({ messages, ...rest }: IChatRequest) {
    const result = await openai.chat.completions.create({
        model: 'deepseek-chat',
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


export async function chatProxy({ messages, ...rest }: IChatRequest) {
    const result = await openai.chat.completions.create({
        model: 'deepseek-chat',
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


export async function chatStreamProxy({ messages, ...rest }: IChatRequest, callback?: (tokenNumber: number) => void) {

    const events = await openai.chat.completions.create({
        model: 'deepseek-chat',
        messages,
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