import { extractCodeFromMd, template } from 'chat-list/utils'
import functionEditPrompt from '../prompts/function-edit/v1.md'
import { chat } from 'chat-list/service/message'
import { IMessageBody } from 'chat-list/types/chat'

export const editFunction = async (input: string, code: string, data: string) => {
    const prompt = template(functionEditPrompt, {
        code, data, input
    })
    const context: IMessageBody = {
        role: 'system',
        content: prompt
    }
    const result = await chat({
        messages: [context],
        temperature: 0
    })
    return extractCodeFromMd(result.content)
}