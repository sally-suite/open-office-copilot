import { OPENAI_API_HOST, OPENAI_API_HOST_GPT4, OPENAI_API_KEY, OPENAI_API_KEY_GPT4 } from "./llm";

// eslint-disable-next-line import/no-anonymous-default-export
export const endPoint = {
    'gpt-3.5-turbo': {
        apiKey: OPENAI_API_KEY,
        apiHost: OPENAI_API_HOST,
        deploymentId: "gpt-35-turbo-0125"
    },
    'gpt-4': {
        apiKey: OPENAI_API_KEY,
        apiHost: OPENAI_API_HOST,
        deploymentId: "gpt-4-0125",
    },
    'gpt-4o': {
        apiKey: OPENAI_API_KEY,
        apiHost: OPENAI_API_HOST,
        deploymentId: "gpt-4o",
    },
    'gpt-4-vision-preview': {
        apiKey: OPENAI_API_KEY_GPT4,
        apiHost: OPENAI_API_HOST_GPT4,
        deploymentId: "vision"
    },
    'dall-e-3': {
        apiKey: OPENAI_API_KEY_GPT4,
        apiHost: OPENAI_API_HOST_GPT4,
        deploymentId: "dall-e-3"
    }
}

export const getEndPoint = (mode: string) => {
    return endPoint[mode]
}