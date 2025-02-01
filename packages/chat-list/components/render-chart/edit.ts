import { extractCodeFromMd } from 'chat-list/utils'
import functionEditPrompt from './prompts/v1.md'
import { chat } from 'chat-list/service/message'
import { IMessageBody } from 'chat-list/types/chat'

export const createChart = async (sheetInfo: string, input: string) => {
    const context: IMessageBody = {
        role: 'system',
        content: functionEditPrompt + '\n' + sheetInfo
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
    return extractCodeFromMd(result.content)
}


export const recommendChart = async (sheetInfo: string, input: string) => {
    const context: IMessageBody = {
        role: 'system',
        content: functionEditPrompt + '\n' + sheetInfo
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
    return extractCodeFromMd(result.content)
}