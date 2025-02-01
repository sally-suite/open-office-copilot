import { extractCodeFromMd, template } from 'chat-list/utils'
import updateTmp from './prompts/update.md'
import createTmp from './prompts/create.md'

import { chat } from 'chat-list/service/message'
import { IMessageBody } from 'chat-list/types/chat'

export const editFunction = async (code: string, input: string) => {
    let tmp = createTmp
    if (code) {
        tmp = template(updateTmp, {
            code
        })
    }
    const context: IMessageBody = {
        role: 'system',
        content: tmp
    }
    const result = await chat({
        messages: [
            context,
            {
                role: 'user',
                content: `User requirement:${input}`
            }
        ],
        temperature: 0.5
    })
    return "```mermaid\n" + extractCodeFromMd(result.content) + "\n```"
}