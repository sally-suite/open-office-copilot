import { IEmbeddingsBody } from 'chat-list/types/chat';
import { getApiConfig } from 'chat-list/local/local';
import { fail } from 'chat-list/components/ui/use-toast';

async function* makeTextSteamLineIterator(reader: ReadableStreamDefaultReader) {
    const utf8Decoder = new TextDecoder("utf-8");
    // let response = await fetch(fileURL);
    // let reader = response.body.getReader();
    let { value: chunk, done: readerDone } = await reader.read();
    chunk = chunk ? utf8Decoder.decode(chunk, { stream: true }) : "";

    const re = /\r\n|\n|\r/gm;
    let startIndex = 0;

    for (; ;) {
        // eslint-disable-next-line prefer-const
        let result = re.exec(chunk);
        if (!result) {
            if (readerDone) {
                break;
            }
            const remainder = chunk.substr(startIndex);
            ({ value: chunk, done: readerDone } = await reader.read());
            chunk =
                remainder + (chunk ? utf8Decoder.decode(chunk, { stream: true }) : "");
            startIndex = re.lastIndex = 0;
            continue;
        }
        yield chunk.substring(startIndex, result.index);
        startIndex = re.lastIndex;
    }
    if (startIndex < chunk.length) {
        // last line didn't end in a newline char
        yield chunk.substr(startIndex);
    }
}

export function mergeToolCalls(toToolCalls: any[], fromToolCalls: any[]) {
    if (fromToolCalls.length <= 0) {
        return toToolCalls;
    }
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

export const chat = async (body: any) => {

    const { apiKey, apiHost } = await getApiConfig();
    const key = apiKey;
    const response = await fetch(`${apiHost}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${key}`,
            "HTTP-Referer": "https://www.sally.bot",
            "X-Title": "Sally",
        },
        body: JSON.stringify(body)
    });
    if (!response.ok) {
        fail(`Request failed with status ${response.status}`);
        throw new Error(`Request failed with status ${response.status}`);
    }
    const result = await response.json();
    // console.log(result)
    return result;
};

export const models = async (apiHost: string, apiKey: string) => {
    const key = apiKey;
    const response = await fetch(`${apiHost}/models`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${key}`,
            "HTTP-Referer": "https://www.sally.bot",
            "X-Title": "Sally",
        }
    });
    console.log(response);
    // check status
    if (!response.ok) {
        fail(`Request failed with status ${response.status}`);
        throw new Error(`Request failed with status ${response.status}`);
    }
    const result = await response.json();
    // console.log(result)
    return result;
};

export const chatStream = async (body: any, callback: any) => {
    const { apiKey, apiHost } = await getApiConfig();
    const key = apiKey;

    const controller = new AbortController();
    const response = await fetch(`${apiHost}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${key}`,
            "HTTP-Referer": "https://www.sally.bot",
            "X-Title": "Sally",
        },
        body: JSON.stringify(body)
    });
    // const result = await response.json();
    if (!response.ok) {
        fail(`Request failed with status ${response.status}`);
        throw new Error(`Request failed with status ${response.status}`);
    }

    const data = response.body;
    const reader = data.getReader();
    let done = false;
    const stop = () => {
        done = true;
        controller.abort();
    };
    const res: any = { content: '', tool_calls: [] };
    const lines = [];
    for await (const line of makeTextSteamLineIterator(reader)) {
        if (!(line as string).startsWith("data:")) {
            continue;
        }
        lines.push(line);
        if (!line || line.includes('[DONE]')) {
            continue;
        }
        const json: any = line.replace(/^data:/, '');
        const data = JSON.parse(json);
        // lines.push(json)
        if (data.choices && data.choices.length > 0) {
            const choice = data.choices[0];
            const content = choice.delta?.content;
            const toolCalls = choice.delta?.tool_calls;
            if (content !== undefined && content != null) {
                res.content += content;

            }
            if (toolCalls != undefined) {
                res.tool_calls = mergeToolCalls(res.tool_calls, toolCalls);
            }
        }
        if (callback && res) {
            await callback(done, res, () => {
                stop();
            });
        }
    }
    if (callback) {
        await callback(true, '', () => {
            stop();
        });
    }
    return res;
};
export const embeddings = async (body: IEmbeddingsBody) => {
    const { apiKey, apiHost } = await getApiConfig();
    const key = apiKey;
    const response = await fetch(`${apiHost}/embeddings`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${key}`,
            "HTTP-Referer": "https://www.sally.bot",
            "X-Title": "Sally",
        },
        body: JSON.stringify(body)
    });
    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
    } else {
        const result = await response.json();
        return result.data[0].embedding;
    }
};

export const generateImages = async (body: any) => {

    const { apiKey, apiHost } = await getApiConfig();
    const key = apiKey;
    const response = await fetch(`${apiHost}/images/generations`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${key}`,
            "HTTP-Referer": "https://www.sally.bot",
            "X-Title": "Sally",
        },
        body: JSON.stringify(body)
    });
    const result = await response.json();
    // console.log(result)
    return result;
};