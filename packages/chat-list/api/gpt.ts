import { IGptService } from 'chat-list/types/api/gpt'
import { IChatBody, IChatResult, IEmbeddingsBody } from 'chat-list/types/chat';
import { isProd } from 'chat-list/utils';
import api from '@api/index';
import { getCurrentModelConfig, getToken } from 'chat-list/local/local';
import * as openai from 'chat-list/service/open-ai'
import { IGetImagesOptions } from 'chat-list/types/image';
import { fail } from 'chat-list/components/ui/use-toast';

class GptServiceMock implements IGptService {
    embeddings = async (body: IEmbeddingsBody) => {
        const { apiKey } = await getCurrentModelConfig();

        if (!apiKey) {
            const token = getToken();
            if (token) {
                return await api.embeddings(body);
            }
        }
        return await openai.embeddings(body);
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

        const { apiKey } = await getCurrentModelConfig();

        if (!apiKey) {
            const { messages = [], temperature = 0, stream, ...rest } = chatBody;
            const token = getToken();

            if (token) {
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
                    const res: any = { content: '', reasoning_content: '', delta: { reasoning_content: '', content: '' }, tool_calls: [] };
                    let lastLine = '';
                    await api.chatStreamLine({
                        messages,
                        temperature,
                        stream,
                        ...rest
                    }, {}, async (done, line, abort) => {
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
                        // lines.push(json)
                        if (data.choices && data.choices.length > 0) {
                            const choice = data.choices[0]
                            if (choice.delta?.reasoning_content) {
                                res.reasoning_content += choice.delta?.reasoning_content;
                                res.delta.reasoning_content = choice.delta?.reasoning_content;
                            } else {
                                res.delta.reasoning_content = '';
                            }
                            if (choice.delta?.content) {
                                res.content += choice.delta?.content;
                                res.delta.content = choice.delta?.content;
                            } else {
                                res.delta.content = '';
                            }

                            const toolCalls = choice.delta?.toolCalls || choice.delta?.tool_calls;
                            if (toolCalls != undefined) {
                                res.tool_calls = openai.mergeToolCalls(res.tool_calls, toolCalls);
                            }
                        } else if (data.error) {
                            fail(data.error.message);
                            throw new Error(JSON.stringify(data.error, null, 2));
                        }
                        if (callback && res) {
                            await callback(done, res, abort);
                        }
                    });
                    return res;
                }
            }
        }

        const { agent, messages = [], temperature = 0, stream = false, ...rest } = chatBody;
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
        const { apiKey } = await getCurrentModelConfig();

        if (!apiKey) {
            return api.generateImages(body);
        }
        return openai.generateImages(body);
    };
    addModel = (value: { id?: string, model: string, provider?: string, baseUrl?: string }) => {
        return api.addModel(value);
    };
    getModels: () => Promise<{ id: string, model: string, provider?: string, baseUrl: string }[]> = () => {
        return api.getModels({});
    };
    removeModel = (id: string) => {
        return api.removeModel({ id });
    };
}

export default new GptServiceMock();