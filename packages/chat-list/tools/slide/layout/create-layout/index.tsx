
import description from './description.md'
import { ChatState, ITool } from 'chat-list/types/plugin';
import creaetLayoutPrompt from './prompts/create-layout.md'
import { chatByPrompt } from 'chat-list/service/message';
import { template } from 'chat-list/utils';
export const func = async ({ content, context }: { content: string, context: ChatState }) => {
    const { appendMsg } = context
    const prompt = template(creaetLayoutPrompt, {
        user_input: content,
    })
    const result = await chatByPrompt(prompt, null, { temperature: 0.7, stream: false });

    return result.content;
}

export default {
    type: 'function',
    name: 'create_layout',
    description,
    parameters: {
        "type": "object",
        "properties": {
            "content": {
                "type": "string",
                "description": `Content need to be layouted and shown in the layout.`
            }
        },
        "required": ['content']
    },
    func
} as unknown as ITool;

