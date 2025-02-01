import { IGptService } from 'chat-list/types/api/gpt'
import { IChatBody, IChatResult, IEmbeddingsBody } from 'chat-list/types/chat';
import { isProd } from 'chat-list/utils';
import api from '@api/index';
import { getApiConfig } from 'chat-list/local/local';
import * as openai from 'chat-list/service/open-ai'
import { IGetImagesOptions } from 'chat-list/types/image';


class GptServiceMock implements IGptService {
    embeddings = async (body: IEmbeddingsBody) => {
        const { apiKey } = getApiConfig();
        if (!apiKey) {
            const result = await api.embeddings(body);
            return result;
        }
        const result = await openai.embeddings(body);
        return result;
    };
    speechToText = async (audio: string): Promise<string> => {
        const result: any = await api.speechToText({
            audio
        })
        if (!isProd()) {
            console.log('speechToText output', result);
        }
        return result;
    };
    chat: (chatBody: IChatBody, callback?: (done: boolean, result: IChatResult, stop: () => void) => void) => Promise<IChatResult> = async (chatBody: IChatBody, callback) => {
        const { apiKey } = await getApiConfig();
        if (!apiKey) {
            const { messages = [], temperature = 0, stream, ...rest } = chatBody;
            if (!stream) {
                const res = await api.chat({
                    messages,
                    temperature,
                    ...rest
                });
                let result;
                if (res.choices.length > 0) {
                    result = res.choices[0].message;
                } else {
                    result = {
                        content: '',
                    };
                }
                if (callback && result) {
                    await callback(true, result, null);
                }
                return result;
            } else {
                const res: any = { content: '', delta: { content: '' }, tool_calls: [] };
                let lastLine = '';
                await api.chatStreamLine({
                    messages,
                    temperature,
                    stream,
                    ...rest
                }, {}, async (done, line, abort) => {
                    console.log(line)
                    if (done) {
                        return callback(done, res, abort);
                    }
                    if (!line || line.includes('[DONE]')) {
                        return;
                    }
                    const json: any = line.replace(/^data:/, '');
                    let data;
                    try {
                        data = JSON.parse(lastLine + json);
                        lastLine = '';
                    } catch (e) {
                        lastLine = json;
                        return;
                    }
                    // const data = JSON.parse(json);
                    // lines.push(json)
                    if (data.choices && data.choices.length > 0) {
                        const choice = data.choices[0]
                        const content = choice.delta?.content;
                        const toolCalls = choice.delta?.toolCalls || choice.delta?.tool_calls;
                        // console.log(content)
                        if (content !== undefined && content != null) {
                            res.content += content;
                            res.delta.content = content;
                        } else {
                            res.delta.content = '';
                        }
                        if (toolCalls != undefined) {
                            res.tool_calls = openai.mergeToolCalls(res.tool_calls, toolCalls);
                        }
                    }
                    if (callback && res) {
                        await callback(done, res, abort);
                    }
                });
                return res;
            }
        }

        const { agent, messages = [], temperature = 0, stream, ...rest } = chatBody;
        if (!stream) {
            const res = await openai.chat({
                messages,
                temperature,
                ...rest
            });
            let result;
            if (res.choices.length > 0) {
                result = res.choices[0].message;
            } else {
                result = {
                    content: '',
                };
            }
            if (callback && result) {
                await callback(true, result, null);
            }
            return result;
        } else {
            let res: any = { content: '', tool_calls: [] };
            await openai.chatStream({
                messages,
                temperature,
                stream,
                ...rest
            }, async (done: boolean, result: IChatResult, stop: any) => {
                if (!result) {
                    return;
                }
                res = result
                if (callback && result) {
                    await callback(done, result, stop);
                }
            });
            if (callback && res) {
                await callback(true, res, stop);
            }
            return res;
        }
    };
    generateImages = async (body: IGetImagesOptions) => {
        const { apiKey } = await getApiConfig();
        if (!apiKey) {
            return api.generateImages(body);
        }
        return openai.generateImages(body);
    }
    addModel = (model: string, provider?: string) => {
        return api.addModel({ model, provider });
    };
    getModels: () => Promise<{ model: string, provider?: string, baseUrl: string }[]> = () => {
        return api.getModels({});
    };
    removeModel = (model: string, provider?: string) => {
        return api.removeModel({ model, provider });
    };
}

export default new GptServiceMock();