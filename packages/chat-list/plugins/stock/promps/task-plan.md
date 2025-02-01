Help me break down the task used into N executed subtasks.


[user requirement]
{{user_requirement}}

[agent list]
{{agents_list}}

use agent above and return task list as follow json schema:
```
{
    "type": "object",
    "properties": {
        "tasks": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string",
                        "description": "agent name"
                    },
                    "requirement": {
                        "type": "string"
                    },
                    "next": {
                        "type": "string"
                    }
                },
                "required": [
                    "name",
                    "requirement",
                    "next"
                ]
            }
        }
    },
    "required": [
        "tasks"
    ]
}
```

Refer to the tasks that have already been executed, update task and return new task list, and refer to the json schema of the preview task.

after all tasks are completed return 'FINISH'
