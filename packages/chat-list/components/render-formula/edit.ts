import functionEditPrompt from './prompts/write-formula.md';
import explainFormulaPrompt from './prompts/explain-formula.md'
import { chatByPrompt } from 'chat-list/service/message'

export const writeFormula = async (input: string) => {
    const result = await chatByPrompt(functionEditPrompt, `User input:${input}`, {
        temperature: 0.5
    })
    return result?.content;
}

export const explainFormula = async (input: string) => {
    const result = await chatByPrompt(explainFormulaPrompt, `User input:${input}`, {
        temperature: 0.5
    })
    return result?.content;
}