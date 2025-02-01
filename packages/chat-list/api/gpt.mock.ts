import { IGptService } from '../types/api/gpt'
import { IChatBody, IChatResult, ICompletionsBody, IEmbeddingsBody } from 'chat-list/types/chat';
import { isProd } from 'chat-list/utils';
import api from '.';
import { IGetImagesOptions } from 'chat-list/types/image';
import { getApiConfig } from 'chat-list/local/local';
import * as openai from 'chat-list/service/open-ai'

class GptServiceMock implements IGptService {
    embeddings = async (body: IEmbeddingsBody) => {
        const result = await api.embeddings({
            body
        })
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
    chat: (chatBody: IChatBody, callback?: (done: boolean, text: string, stop: () => void) => void) => Promise<IChatResult> = async (chatBody: IChatBody, callback) => {
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
    completions: (body: ICompletionsBody) => Promise<string> = async (body: ICompletionsBody) => {
        const { prompt = '', temperature = 0, ...rest } = body;
        if (!isProd()) {
            console.log('completions input', prompt);
        }
        const result = await api.completions({
            prompt,
            temperature,
            ...rest
        });
        return result;
    };
    generateImages = async (body: IGetImagesOptions) => {
        const { apiKey } = await getApiConfig();
        if (!apiKey) {
            return api.generateImages(body);
        }
        return openai.generateImages(body);
    }
    addModel = (model: string, baseUrl: string) => {
        return api.addModel({ model, baseUrl });
    };
    getModels: () => Promise<{ model: string, baseUrl: string }[]> = () => {
        return api.getModels({});
    };
    removeModel = (model: string) => {
        return api.removeModel({ model });
    };

}

export default new GptServiceMock();