import { IChatRequest } from "@/types/chat";

import { GoogleGenerativeAI } from "@google/generative-ai";

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

const roleMap = {
    user: 'user',
    system: 'user',
    assistant: 'model',
};
const chatConfig = {
    safetySettings: [
        {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_ONLY_HIGH',
        },
    ],
    generationConfig: {
        stopSequences: [],
        temperature: 1.0,
        maxOutputTokens: 800,
        topP: 0.8,
        topK: 10,
    },
};

const convertMessages = (msg) => {
    if (
        msg.role == 'assistant' &&
        msg.tool_calls &&
        msg.tool_calls.length > 0
    ) {
        return {
            role: 'model',
            parts: msg.tool_calls.map((tool) => {
                const func = tool.function;
                const name = func.name;
                const args = JSON.parse(func.arguments);
                return {
                    functionCall: { name, args },
                };
            }),
        };
    }
    if (msg.role == 'assistant' && msg.content) {
        return {
            role: 'model',
            parts: [{ text: msg.content }],
        };
    }
    if ((msg.role == 'user' || msg.role == 'system') && msg.content) {
        return {
            role: 'user',
            parts: [{ text: msg.content }],
        };
    }
    if (msg.role == 'tool') {
        return {
            role: 'function',
            parts: [
                {
                    functionResponse: {
                        name: msg.name,
                        response: {
                            name: msg.name,
                            content: msg.content,
                        },
                    },
                },
            ],
        };
    }
}
const convertTools = (tools) => {
    const function_declarations = tools.map((tool) => {
        return tool.function;
    });
    return [
        {
            function_declarations,
        },
    ];
}
const convertChatParams = (params): { contents: any[], tools?: any[], generationConfig: any, safetySettings: any } => {
    const { messages = [], tools } = params;
    const contents = messages.map(convertMessages).reduce((pre, msg) => {
        if (pre.length == 0) {
            return [msg];
        }
        const preRole = pre[pre.length - 1].role;
        if (preRole === 'model') {
            if (msg.role == 'model' && !msg.parts[0].functionCall) {
                return pre.concat([
                    {
                        role: 'user',
                        parts: [{ text: 'Ok' }],
                    },
                    msg,
                ]);
            }
        } else if (preRole === 'user') {
            if (msg.role === 'user') {
                return pre.concat([
                    {
                        role: 'model',
                        parts: [{ text: 'Ok' }],
                    },
                    msg,
                ]);
            }
        }
        return pre.concat([msg]);
    }, []);
    if (contents[contents.length - 1].role === 'model') {
        contents.pop();
    }
    if (tools) {
        const tols = convertTools(tools);
        return {
            contents,
            tools: tols,
            ...chatConfig,
        };
    }
    return {
        contents,
        ...chatConfig,
    };
}


export async function chat(body: IChatRequest) {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const message = convertChatParams(body);
    const history = message.contents.slice(0, -1);
    console.log(JSON.stringify(history, null, 2))
    const chat = model.startChat({
        history: history,
        generationConfig: {
            maxOutputTokens: 100,
        },
    });

    const userInput = message.contents.pop().parts[0].text;
    console.log(userInput)
    const result = await chat.sendMessage(userInput);
    const response = await result.response;
    const text = response.text();
    console.log(text);

    return {
        content: text,
    }
}