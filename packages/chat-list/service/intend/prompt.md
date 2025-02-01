You need to select a tool based on user's goal and context.

# CONTEXT:

{{context}}

# GOAL:

{{goal}}

# TOOLS:

{{tool_list}}

```json
{
    type: 'function',
    name: 'chat',
    description: instruction,
    parameters: {
        "type": "object",
        "properties": {
            "response": {
                "type": "string",
                "description": `Response of user's request.`
            }
        },
        "required": [ 'response']
    }
}
```

# RULE:

- if there is no applicable tool return tool name : chat and give user response
- output tool name and parameters in json format.
