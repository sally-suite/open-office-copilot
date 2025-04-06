
import { QIANFAN_ACCESS_KEY, QIANFAN_SECRET_KEY } from "@/constants/llm";
import { IChatRequest } from "@/types/chat";
import { ChatCompletion } from "@baiducloud/qianfan";
import { CompletionsResponseMessage, CreateCompletionsOptions, MessageOptions } from "zhipuai-sdk-nodejs-v4/dist/types/completions";

// 通过参数初始化，设置安全认证ACCESS_KEY/SECRET_KEY，以对话Chat为例，调用如下
const modelName = 'ERNIE-Speed-128K';

export async function chat({ messages, ...rest }: IChatRequest) {

    const client = new ChatCompletion({ QIANFAN_ACCESS_KEY: QIANFAN_ACCESS_KEY, QIANFAN_SECRET_KEY: QIANFAN_SECRET_KEY });

    // const client = new OpenAIClient(apiHost, new AzureKeyCredential(apiKey));
    const newMsgs = convertMessage(messages as MessageOptions[]);

    const result = await client.chat({
        messages: newMsgs,
        ...rest
    } as CreateCompletionsOptions, modelName) as any;
    if (result.result.length > 0) {
        const usage = result.usage;
        return {
            role: 'assistant',
            content: result.result,
            usage
        }
    }
    return {
        error: {
            message: 'no result'
        }
    }
}

export async function chatProxy({ messages, ...rest }: IChatRequest) {
    // const { apiKey, apiHost, deploymentId } = getEndPoint(rest.model);
    const client = new ChatCompletion({ QIANFAN_ACCESS_KEY: QIANFAN_ACCESS_KEY, QIANFAN_SECRET_KEY: QIANFAN_SECRET_KEY });

    try {
        const newMsgs = convertMessage(messages as MessageOptions[]);
        const result = await client.chat({
            messages: newMsgs,
            ...rest
        } as CreateCompletionsOptions, modelName) as any;
        if ((result as any)?.error?.message) {
            return {
                error: {
                    message: (result as any).error?.message
                }
            }
        }
        if (result.result.length > 0) {
            const usage = result.usage;
            return {
                id: '',
                model: rest.model,
                choices: [
                    {
                        index: 0,
                        message: {
                            role: 'assistant',
                            content: result.result,
                            tool_calls: [],
                        },

                    }
                ],
                usage
            }
        }
        return result;
    } catch (e) {
        return {
            error: {
                message: e?.message
            }
        }
    }
}


export async function chatStreamProxy({ messages, tools, temperature, ...rest }: IChatRequest, callback?: (tokenNumber: number) => void) {
    // const { apiKey, apiHost, deploymentId } = getEndPoint(rest.model);
    let newMsgs = convertMessage(messages as MessageOptions[]);
    const client = new ChatCompletion({ QIANFAN_ACCESS_KEY: QIANFAN_ACCESS_KEY, QIANFAN_SECRET_KEY: QIANFAN_SECRET_KEY });

    try {


        const events = await client.chat({
            messages: newMsgs,
            stream: true,
            temperature: 0.7,
            ...rest
        } as CreateCompletionsOptions, modelName) as any;

        // for await (const chunk of events as AsyncIterableIterator<any>) {
        //     // 返回结果
        // }

        const textEncoder = new TextEncoder();
        let total_tokens = 0;
        const stream = new ReadableStream({
            async start(controller) {
                for await (const event of events) {
                    const content = event.result;
                    const body = { "choices": [{ "index": 0, "delta": { "content": content, "tool_calls": [] } }] }
                    const line = `data:${JSON.stringify(body)}`;
                    controller.enqueue(textEncoder.encode(line));
                    controller.enqueue(textEncoder.encode(`\n`));
                    controller.enqueue(textEncoder.encode(`\n`));
                    if (event.is_end) {
                        total_tokens = event.usage.total_tokens;
                    }
                }
                controller.close();
                if (callback) {
                    await callback(total_tokens);
                }
            },
        })
        return new Response(stream);
    } catch (e) {
        const message = JSON.parse(e.message);
        const textEncoder = new TextEncoder();
        let total_tokens = 0;
        const stream = new ReadableStream({
            async start(controller) {
                const content = message.error_msg;
                const body = { "choices": [{ "index": 0, "delta": { "content": content, "tool_calls": [] } }] }
                const line = `data:${JSON.stringify(body)}`;
                controller.enqueue(textEncoder.encode(line));
                controller.enqueue(textEncoder.encode(`\n`));
                controller.close();
                if (callback) {
                    await callback(total_tokens);
                }
            },
        })
        return new Response(stream);
    }

}

export const whisper = async (second) => {

}

export const convertMessage = (messages: MessageOptions[]) => {
    const msgs = messages.map((msg) => {
        let content = msg.content;
        // if (Array.isArray(msg.content)) {
        //     content = (msg.content as any).map((item) => {
        //         if (item.type == 'text') {
        //             return {
        //                 type: 'text',
        //                 text: item.text,
        //             };
        //         } else if (item.type === 'image_url') {
        //             const urls = item.image_url.url.split(';');
        //             if (urls.length > 1) {
        //                 return {
        //                     type: "image_url",
        //                     image_url: {
        //                         url: urls[1].split(',')[1]
        //                     }
        //                 };
        //             } else {
        //                 return item;
        //             }
        //         }
        //     });
        // }

        const role = msg.role === 'system' ? 'user' : msg.role;
        return {
            role,
            content,
        };
    });
    // 再连续两个user之前插入assistant 角色，内容是ok
    const list = msgs.reduce((pre, cur) => {
        if (pre.length == 0) {
            return [cur]
        }
        if (pre[pre.length - 1].role === 'user' && cur.role === 'user') {
            pre.push({ role: 'assistant', content: 'ok' });
        }
        pre.push(cur);
        return pre;
    }, [])
    return list;
}