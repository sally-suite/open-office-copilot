import { chatByTemplate } from 'chat-list/service/message'
import filterPrompt from './filter.md'
import { extractJsonDataFromMd } from 'chat-list/utils'

export const filterPapers = async (papers: string, subject: string) => {
    const result = await chatByTemplate(filterPrompt, {
        paper_list: papers,
        subject: subject
    })
    return extractJsonDataFromMd(result?.content);
}