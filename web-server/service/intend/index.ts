import { template } from '@/utils';
// import prompt from './prompt.txt'
import { Message, ToolFunction } from '@/types/chat';

const prompt = `Analyze user goals and select appropriate tools

RULES:
1. Determine if tool invocation is needed based on user input and chat history
2. If tool is needed, output invocation info strictly following the tool's JSON Schema
3. If no tool is needed, directly summarize task completion in natural language
4. If no matching tool exists, use default chat tool to answer user's question

INPUT:

History: 
{{history}}

Available Tools: 
{{tools}}

User Input: 
{{user_input}}

OUTPUT FORMAT:
1. When tool invocation is needed:
\`\`\`json
{
    "type": "function",
    "function": {
        "name": "tool_name",
        "parameters": {
            // Parameters strictly following tool schema
        }
    }
}
\`\`\`

`


export const buildMessage2 = (messages: Message[], tools: ToolFunction[]): Message[] => {
    // console.log('=======')
    // const system = messages.find(m => m.role === 'system')
    // const history = messages.filter(m => m.role !== 'system').slice(0, -1)
    // const input = messages[messages.length - 1].content;
    // console.log(input)
    // const tols = `${JSON.stringify(tools, null, 2)}`
    // const content = template(prompt, {
    //     history: JSON.stringify(history, null, 2),
    //     user_input: input,
    //     system: system?.content,
    //     tools: tols
    // })
    // console.log(content)
    const tarTools = tools.push({
        "type": "function",
        "function": {
            "name": "chat",
            "description": "answer user's question",
            "parameters": {
                "type": "object",
                "properties": {
                    "response": {
                        "type": "string",
                        "description": "Response of user's request."
                    }
                },
                "required": [
                    "response"
                ]
            }
        }
    })
    const data = JSON.stringify({ messages, tools: tarTools }, null, 2)
    return [
        // system,
        {
            role: 'user',
            content: data
        }
    ]
}

export const buildMessageForUser = (messages: Message[], tools: ToolFunction[]): Message[] => {
    const system = messages.find(m => m.role === 'system')
    const history = messages.filter(m => m.role !== 'system').slice(0, -1)
    const userMessages = messages.filter(m => m.role == 'user');

    let input = 'no input message'
    if (userMessages.length > 0) {
        input = userMessages[userMessages.length - 1].content;
    }

    const tols = `${JSON.stringify(tools, null, 2)}`
    const content = template(prompt, {
        history: JSON.stringify(history, null, 2),
        user_input: input,
        tools: tols
    })

    if (system) {
        return [
            system,
            {
                role: 'user',
                content: content
            }
        ]
    }
    return [
        {
            role: 'user',
            content: content
        }
    ]

}

export const buildMessageForStream = (messages: Message[], tools: ToolFunction[]) => {
    return messages.map((msg) => {
        if (msg.role === 'system') {
            return msg;
        }

        if (msg.role === 'assistant' && msg?.tool_calls?.length > 0) {
            return {
                role: 'assistant',
                content: "call tools:\n\n" + msg?.tool_calls.map(p => p.function.name).join(',')
            }
        }
        if (msg.role == 'tool') {
            return {
                role: 'user',
                content: `Tool call result:\n\n${msg.content}\n\nReply to me in the same language I used.`
            }
        }

        return msg;
    })
}

export const buildMessageForTool = (messages: Message[], tools: ToolFunction[]): Message[] => {
    return messages.map((msg) => {
        if (msg.role === 'system') {
            return msg;
        }

        if (msg.role === 'assistant' && msg?.tool_calls?.length > 0) {
            return {
                role: 'assistant',
                content: "call tools:\n\n" + msg?.tool_calls.map(p => p.function.name).join(',')
            }
        }
        if (msg.role == 'tool') {
            return {
                role: 'user',
                content: `Tool call result:\n\n${msg.content}\n\nReply to me in the same language I used.`
            }
        }

        return msg;
    })
}

export const removeToolForMessage = (messages: Message[]): Message[] => {

    return messages.map((msg) => {
        if (msg.role === 'system') {
            return msg;
        }

        if (msg.role === 'assistant' && msg?.tool_calls?.length > 0) {
            return {
                role: 'assistant',
                content: "call tools:\n\n" + msg?.tool_calls.map(p => p.function.name).join(',')
            }
        }
        if (msg.role == 'tool') {
            return {
                role: 'user',
                content: `Tool call result:\n\n${msg.content}\n\nReply to me in the same language I used.`
            }
        }

        return msg;
    })
}