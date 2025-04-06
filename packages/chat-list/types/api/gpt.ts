import { IChatBody, IChatResult, ICompletionsBody, IEmbeddingsBody } from "chat-list/types/chat";
import { IGetImagesOptions, ImageGenerations } from "chat-list/types/image";

export interface IGptService {
    speechToText: (value: string) => Promise<string>;
    chat: (body: IChatBody, callback?: (done: boolean, result: IChatResult, stop: () => void) => void) => Promise<IChatResult>;
    completions?: (body: ICompletionsBody) => Promise<string>;
    embeddings: (body: IEmbeddingsBody) => Promise<number[]>;
    generateImages?: (body: IGetImagesOptions) => Promise<ImageGenerations>;
    addModel?: (value: { id?: string, model: string, provider?: string, baseUrl?: string }) => Promise<void>;
    getModels?: () => Promise<{ model: string, baseUrl: string }[]>;
    removeModel?: (id: string) => Promise<void>;
}