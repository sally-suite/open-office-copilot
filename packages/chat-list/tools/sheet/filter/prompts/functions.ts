import { ToolFunction } from "chat-list/types/chat";

// import { colors } from 'chat-list/data/templates/colors'
export default function funcs(): ToolFunction[] {
    return [
        {
            type: "function",
            function: {
                "name": "highlightRowsWithColor",
                "description": `Flter out the data rows that need to be highlighted.`,
                "parameters": {
                    "type": "object",
                    "properties": {
                        "condition": {
                            "type": "string",
                            "description": `filter condition`
                        }
                    },
                    "required": [
                        "condition"
                    ]
                }
            }
        },
        // {
        //     type: "function",
        //     function: {
        //         "name": "clearHighlightRows",
        //         "description": `Clear all hightlight rows`,
        //         "parameters": {
        //             "type": "object",
        //             "properties": {
        //                 "rows": {
        //                     "type": "array",
        //                     "description": `row number to clear`,
        //                     "items": {
        //                         "type": "number"
        //                     }
        //                 }
        //             },
        //             "additionalProperties": true
        //         }
        //     }
        // }

    ];
}