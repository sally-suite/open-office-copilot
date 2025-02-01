import { ITool } from 'chat-list/types/plugin';
import { chatByPrompt, chatByTemplate } from '../message';
import prompt from './prompt.md'
import { extractJsonDataFromMd } from 'chat-list/utils';

export const getTool = async (context: string, goal: string, tools: ITool[]) => {
    const toolList = tools.map((tool) => {
        const { name, description, parameters } = tool
        const json = {
            name,
            description,
            parameters
        }
        return "```json\n" + JSON.stringify(json, null, 2) + "\n```"
    }).join('\n\n')

    const result = await chatByTemplate(prompt, {
        context,
        goal,
        tool_list: toolList
    }, {
        temperature: 0.7,
        stream: false,
        // response_format: { "type": "json_object" },
    })
    return extractJsonDataFromMd(result.content)
}