
import { OpenAIClient, AzureKeyCredential } from "@azure/openai";
import { getEndPoint } from "@/constants/endpoint";
import { IGetImagesOptions } from "@/types/image";

export async function generateImage({ model, prompt, n = 1, size = '1024x1024', style = 'vivid', quality = 'standard', response_format = 'b64_json' }: IGetImagesOptions) {
    const { apiKey, apiHost, deploymentId } = getEndPoint(model);

    const client = new OpenAIClient(apiHost, new AzureKeyCredential(apiKey));
    const result = await client.getImages(deploymentId, prompt, {
        n,
        size,
        style,
        quality,
        responseFormat: response_format
    });
    if (result?.data?.[0].base64Data) {
        return {
            created: result.created,
            data: [{
                b64_json: result.data[0].base64Data,
                revised_prompt: result.data[0].revisedPrompt
            }]
        }
    } else if (result?.data?.[0].url) {
        return {
            created: result.created,
            data: [{
                url: result.data[0].url,
                revised_prompt: result.data[0].revisedPrompt
            }]
        }
    }
    return {
        created: result.created,
        data: []
    };
}

