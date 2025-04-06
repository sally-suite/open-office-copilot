You need to select a tool based on user's goal and history message list,

RULE:

- Output tool information strictly based on json schema of the tool
- If there is no matching Tool, use chat tool answer user's question.

HISTORY:
{{history}}

TOOLS:
{{tools}}

USER INPUT:
{{user_input}}

SAMPLE:
Tool definition:

```json
{
  "type": "function",
  "function": {
    "name": "edit_data",
    "description": "",
    "parameters": {
      "type": "object",
      "properties": {
        "script": {
          "type": "string",
          "description": ""
        },
        "explain": {
          "type": "string",
          "description": ""
        }
      },
      "required": ["script", "explain"]
    }
  }
}
```

Tool output:

```json
{
  "type": "function",
  "function": {
    "name": "edit_data",
    "parameters": {
      "script": "",
      "explain": ""
    }
  }
}
```
