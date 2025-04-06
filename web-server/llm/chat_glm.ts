
import { GLM_API_KEY, OPENAI_API_HOST, OPENAI_API_HOST_GPT4, OPENAI_API_KEY, OPENAI_API_KEY_GPT4 } from "@/constants/llm";
import { OpenAIClient, AzureKeyCredential } from "@azure/openai";
import { IChatRequest, Message } from "@/types/chat";
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { encodingForModel } from "js-tiktoken";
import { getEndPoint } from "@/constants/endpoint";
import { ZhipuAI } from 'zhipuai-sdk-nodejs-v4';
import { CompletionsResponseMessage, CreateCompletionsOptions, MessageOptions } from "zhipuai-sdk-nodejs-v4/dist/types/completions";
// import wasm from "tiktoken/lite/tiktoken_bg.wasm?module";
// import model from "tiktoken/encoders/cl100k_base.json";
// import { init, Tiktoken } from "tiktoken/lite/init";

export async function chat({ messages, ...rest }: IChatRequest) {
    const client = new ZhipuAI({
        apiKey: GLM_API_KEY
    })

    // const client = new OpenAIClient(apiHost, new AzureKeyCredential(apiKey));
    const result: CompletionsResponseMessage = await client.createCompletions({
        messages,
        ...rest
    } as CreateCompletionsOptions) as CompletionsResponseMessage;
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
    // const { apiKey, apiHost, deploymentId } = getEndPoint(rest.model);
    let newMsgs: MessageOptions[] = convertUserMessages(messages) as MessageOptions[]
    if (rest.model === 'glm-4v') {
        newMsgs = convertMessage(messages as MessageOptions[]);
    }
    const client = new ZhipuAI({
        apiKey: GLM_API_KEY
    })
    try {
        const result: CompletionsResponseMessage = await client.createCompletions({
            messages: newMsgs,
            ...rest
        } as CreateCompletionsOptions) as CompletionsResponseMessage;
        if ((result as any)?.error?.message) {
            return {
                error: {
                    message: (result as any).error?.message
                }
            }
        }
        return result;
    } catch (e) {
        return e;
    }

}


export async function chatStreamProxy({ messages, ...rest }: IChatRequest, callback?: (tokenNumber: number) => void) {
    // const { apiKey, apiHost, deploymentId } = getEndPoint(rest.model);
    let newMsgs: MessageOptions[] = convertUserMessages(messages) as MessageOptions[]
    if (rest.model === 'glm-4v') {
        newMsgs = convertMessage(messages as MessageOptions[]);
    }
    const client = new ZhipuAI({
        apiKey: GLM_API_KEY
    })
    const events = await client.createCompletions({
        messages: newMsgs,
        stream: true,
        ...rest
    } as CreateCompletionsOptions) as any;

    const textEncoder = new TextEncoder();
    let total_tokens = 0;
    const stream = new ReadableStream({
        async start(controller) {
            for await (const event of events) {
                // console.log(event.usage)
                const line = event.toString();
                // 通过正则，从line里提取"total_tokens":78
                const match = line.match(/"total_tokens":(\d+)/);
                if (match) {
                    total_tokens = parseInt(match[1]);
                }
                controller.enqueue(textEncoder.encode(line));
                controller.enqueue(textEncoder.encode(`\n`));
            }
            controller.close();
            if (callback) {
                await callback(total_tokens);
            }
        },
    })
    return new Response(stream);
}

export const whisper = async (second) => {

}

export const convertUserMessages = (messages: Message[]) => {
    if (messages.length === 1) {
        return messages.map(((item) => {
            if (item.role === 'system') {
                return {
                    role: 'user',
                    content: item.content
                }
            }
            return item;
        }))
    }
    return messages;
}

export const convertMessage = (messages: MessageOptions[]) => {
    return messages.map((msg) => {
        const content = (msg.content as any).map((item) => {
            if (item.type == 'text') {
                return {
                    type: 'text',
                    text: item.text,
                };
            } else if (item.type === 'image_url') {
                const urls = item.image_url.url.split(';');
                if (urls.length > 1) {
                    return {
                        type: "image_url",
                        image_url: {
                            url: urls[1].split(',')[1]
                        }
                    };
                } else {
                    return item;
                }
            }
        });
        return {
            role: msg.role,
            content,
        };
    });
}