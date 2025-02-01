import { IGptService } from '../types/api/gpt'
import { IChatBody, IChatResult, ICompletionsBody, IEmbeddingsBody } from 'chat-list/types/chat';
import api from '.';
import { IGetImagesOptions } from 'chat-list/types/image';
import { getApiConfig } from 'chat-list/local/local';
import * as openai from 'chat-list/service/open-ai'

class GptServiceMock implements IGptService {
    speechToText: (value: string) => Promise<string>;
    embeddings = async (body: IEmbeddingsBody) => {
        const result = await api.embeddings({
            body
        })
        return result;
    };
    chat: (chatBody: IChatBody, callback?: (done: boolean, result: IChatResult, stop: () => void) => void) => Promise<IChatResult> = async (chatBody: IChatBody, callback) => {
        const { messages = [], temperature = 0, stream, ...rest } = chatBody;
        if (!stream) {
            const result = await api.chat({
                messages,
                temperature,
                ...rest
            });
            return result;
        } else {
            return api.chatStream({
                messages,
                temperature,
                ...rest
            }, {}, callback);
        }
    };
    completions: (body: ICompletionsBody) => Promise<string>;
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