import { ToolFunction } from "chat-list/types/chat";

export default function funcs(): ToolFunction[] {
    return [
        {
            type: 'function',
            function: {
                "name": "translateSheet",
                "description": `Translate sheet data to target language,if use's input include sheet,table,excel,call this function`,
                "parameters": {
                    "type": "object",
                    "properties": {
                        "target": {
                            "type": "string",
                            "description": `Target language code`
                        }
                    },
                    "required": [
                        "content",
                        "target"
                    ]
                }
            }
        },
        {
            type: 'function',
            function: {
                "name": "translateText",
                "description": `Translate user input content to target language.`,
                "parameters": {
                    "type": "object",
                    "properties": {
                        "target": {
                            "type": "string",
                            "description": `Target language code`
                        }
                    },
                    "required": [
                        "target"
                    ]
                }
            }
        }
    ];
}