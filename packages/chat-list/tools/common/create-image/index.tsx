



import { ChatState, ITool } from 'chat-list/types/plugin';
import { buildChatMessage } from 'chat-list/utils';
import gpt from '@api/gpt';
import { ImageGenerations } from 'chat-list/types/image';

export const func: ITool['func'] = async ({ prompt, style, context }: { prompt: string, style: string, context: ChatState }): Promise<any> => {
    const { appendMsg } = context;
    const result: ImageGenerations = await gpt.generateImages({
        prompt,
        n: 1,
        style: 'vivid',
        model: 'dall-e-3',
        response_format: 'url'
    });
    if (result?.data?.[0].b64_json) {
        const content = `![image](data:image/png;base64,${result.data[0].b64_json})\n\n**Prompt:**\n\n${result?.data?.[0].revised_prompt}`;
        appendMsg(buildChatMessage(content, 'text', 'assistant'));
        return 'Task completed';
    } if (result?.data?.[0].url) {
        const content = `![image](${result.data[0].url})\n\n**Prompt:**\n\n${result?.data?.[0].revised_prompt}`;
        appendMsg(buildChatMessage(content, 'text', 'assistant'));
        return `Task completed,image link is "${result.data[0].url}", Tell user the image link is valid for one hour.`;
    } else {
        appendMsg(buildChatMessage('Failed to generate image', 'text', 'assistant'));
        return 'Task failed';
    }
};

export default {
    "name": "create_images",
    "description": "Generate image using DALL-E",
    "parameters": {
        "type": "object",
        "properties": {
            "prompt": {
                "type": "string",
                "description": `image generation prompt`
            }
        },
        "required": [
            "prompt"
        ]
    },
    func
} as unknown as ITool;