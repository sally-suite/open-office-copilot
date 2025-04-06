
import { OpenAIClient, AzureKeyCredential } from "@azure/openai";
import { getEndPoint } from "@/constants/endpoint";
import { IGetImagesOptions } from "@/types/image";


import OpenAI from "openai";
import { DEEPBRICKS_API_KEY, DEEPBRICKS_BASE_URL } from "@/constants/llm";

const openai = new OpenAI({
    apiKey: DEEPBRICKS_API_KEY,
    baseURL: DEEPBRICKS_BASE_URL
});


export async function generateImage({ model, prompt, n = 1, size = '1024x1024', style = 'vivid', quality = 'standard', response_format = 'b64_json' }: IGetImagesOptions) {

    const result = await openai.images.generate({
        prompt,
        model,
        n,
        size,
        style,
        quality,
        response_format
    });
    if (result?.data?.[0].b64_json) {
        return {
            created: result.created,
            data: [{
                b64_json: result.data[0].b64_json,
                revised_prompt: result.data[0].revised_prompt
            }]
        }
    } else if (result?.data?.[0].url) {
        return {
            created: result.created,
            data: [{
                url: result.data[0].url,
                revised_prompt: result.data[0].revised_prompt
            }]
        }
    }
    return {
        created: result.created,
        data: []
    };
}

