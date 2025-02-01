



import { ChatState, ITool } from 'chat-list/types/plugin';
import description from './description.md'
import { buildChatMessage } from 'chat-list/utils';


export const main: ITool['func'] = async ({ uml_code_array, context }: { uml_code_array: any[], context: ChatState }): Promise<any> => {
    // const result = await chatByPrompt(description, requirement)
    // return result.content;
    console.log(uml_code_array)
    const { appendMsg } = context;
    // let result = '';
    for (let i = 0; i < uml_code_array.length; i++) {
        const { uml_code } = uml_code_array[i];
        // result += "\n```mermaid\n" + uml_code + "\n```\n";
        appendMsg(buildChatMessage("```mermaid\n" + uml_code + "\n```", 'text'))
    }
    // console.log(result)
    // appendMsg(buildChatMessage(result, 'text'))
    return 'Task done';
}

export default {
    "name": "recommend_uml",
    "description": description,
    "parameters": {
        "type": "object",
        "properties": {
            "uml_code_array": {
                "type": "array",
                "description": `UML code array`,
                "items": {
                    "type": "object",
                    "properties": {
                        "uml_code": {
                            "type": "string",
                            "description": `UML Diagrams code using mermaid UML`
                        }
                    },
                    "required": [
                        "uml_code"
                    ]
                }
            }
        },
        "required": [
            "uml_code_array"
        ]
    },
    func: main
} as unknown as ITool;