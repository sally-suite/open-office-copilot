import { GptModel, IChatBody, IChatResult, ICompletionsBody, IMessageBody } from "chat-list/types/chat";
import gptApi from '@api/gpt';

import { getModel } from 'chat-list/local/local';
import { blobToBase64Image, resizeImg, template } from "chat-list/utils";
import { IChatMessage } from "chat-list/types/message";
// import { isProd } from "chat-list/utils";

// export const getMessages = async (
//     conversationId: string
// ): Promise<IMessageEntity[]> => {
//     return await getMessagesByConversation(conversationId);
// };

// export const getModel = async (): Promise<GptModel> => {
//     let model = getLocalStore(USER_SET_AI_MODEL) as GptModel
//     if (model) {
//         return model;
//     }
//     // model = await userApi.getUserProperty(USER_SET_AI_MODEL) as GptModel;
//     model = 'gpt-3.5-turbo';
//     setLocalStore(USER_SET_AI_MODEL, model);
//     return model;
// }


export const chat = async (chatBody: IChatBody, callback?: (done: boolean, result: IChatResult, stop: () => void) => void): Promise<IChatResult> => {
    // if (!isProd()) {
    // console.log('chat input', chatBody.messages, chatBody.tools);
    // }

    const { stream } = chatBody;
    if (!stream) {
        return chatJson(chatBody);
    } else {
        return chatStream(chatBody, callback);
    }
};
//tools?: ToolFunction[], temperature = 0.5
export const chatByPrompt = async (prompt = '', input = '', options: Partial<IChatBody> = {}, callback?: (done: boolean, result: IChatResult, stop: () => void) => void) => {
    const messages: IMessageBody[] = [];
    if (prompt) {
        messages.push({ role: 'system', content: prompt });
    }
    if (input) {
        messages.push({ role: 'user', content: input });
    }
    const result = await chat({
        messages,
        ...options
    }, callback);
    return result;
};

export const chatJson = async (chatBody: IChatBody): Promise<IChatResult> => {
    // if (!isProd()) {
    // console.log('chat input', chatBody.messages, chatBody.tools);
    // }


    const { model: initModel, messages = [], tools, temperature = 0.5, ...rest } = chatBody;
    let model = initModel; //await getModel();
    if (!model) {
        model = await getModel();
    }
    const result: any = await gptApi.chat({
        model,
        messages,
        temperature,
        tools: tools && tools.length > 0 ? tools : undefined,
        ...rest
    });
    // if (!isProd()) {
    // console.log('chat output', result);
    // }
    if (chatBody.functions && chatBody.functions.length > 0) {
        if (result.function_call) {
            return {
                content: result.content,
                function_call: result.function_call
            };
        }
    }
    if (chatBody.tools && chatBody.tools.length > 0) {
        if (result.tools) {
            return {
                content: result.content,
                tool_calls: result.tool_calls
            };
        }
    }
    return result;
};

export const chatStream = async (chatBody: IChatBody, callback?: (done: boolean, result: IChatResult, stop: () => void) => void): Promise<IChatResult> => {

    const { model: initModel, messages = [], temperature = 0.5, tools, ...rest } = chatBody;
    let model = initModel; //await getModel();
    if (!model) {
        model = await getModel();
    }
    const result: any = await gptApi.chat({
        model,
        messages,
        temperature,
        tools: tools && tools.length > 0 ? tools : undefined,
        ...rest
    }, callback);
    // if (!isProd()) {
    //     console.log('chat output', result);
    // }
    // if (chatBody.functions && chatBody.functions.length > 0) {
    //     if (result.function_call) {
    //         return {
    //             content: result.content,
    //             function_call: result.function_call
    //         };
    //     }
    // }
    // if (chatBody.tools && chatBody.tools.length > 0) {
    //     if (result.tools) {
    //         return {
    //             content: result.content,
    //             tool_calls: result.tool_calls
    //         };
    //     }
    // }
    return result;
};

export const completions = async (completionBody: ICompletionsBody) => {
    const { prompt = '', temperature = 0.5, ...rest } = completionBody;
    // console.log('completions input', prompt);

    const result = await gptApi.completions({
        prompt,
        temperature,
        model: '',
        ...rest
    });
    // console.log('completions output', result);

    return result;
};

export const speechToText = async (audio: string) => {
    const result: any = await gptApi.speechToText(audio);
    // if (!isProd()) {
    console.log('chat output', result);
    return result;
};


export const chatByTemplate = async (promptTemplate: string,
    data?: Record<string, string>,
    options: Partial<IChatBody> = {},
    callback?: (done: boolean, result: IChatResult, stop: () => void) => void
) => {
    const prompt = template(promptTemplate, data || {});
    const result = await chatByPrompt('', prompt, {
        temperature: 0.8,
        stream: false,
        ...options
    }, callback);
    return result;
};

const convertMessage = async (message: IChatMessage): Promise<IMessageBody> => {
    const { type, text, files } = message;
    const ps = files.filter(p => p.type.startsWith('image')).map(async (file) => {
        const base64 = await blobToBase64Image(file);
        const url = await resizeImg(base64, 512, 512);
        return {
            type: 'image_url',
            image_url: {
                url
            }
        };
    });

    const images = await Promise.all(ps);
    const msgs: any = [{ type: 'text', text: text }, ...images];
    return {
        role: 'user',
        content: msgs
    };
};
export const chatWithImage = async (image: File, input: string, callback?: (done: boolean, result: IChatResult, stop: () => void) => void) => {
    const msg = await convertMessage({ text: input, files: [image], type: 'parts' } as any);
    const vm: GptModel = "gpt-4o";
    const result = await chat({
        model: vm,
        messages: [msg],
        max_tokens: 1024,
        stream: true,
        temperature: 0.7
    }, callback);
    return result;
};