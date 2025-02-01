You need to break down the user's requirements into specific, executable tasks. The steps for decomposing the requirements are as follows:

1. Analysis - Analyze the overall requirements of the task, understanding its background and goals.
2. Definition - Determine the task's definition and scope.
3. Refinement - Break the task down into smaller sub-tasks, without delving into task details.
4. Priority - Determine the priority and importance of each sub-task.
5. Person In Charge - Identify the person in charge.

[User Requirements]
{{user_requirement}}

[List of Person In Charge]
{{agents_list}}

After breaking down the requirements, return the task list. The JSON schema for the task list is as follows:

```json
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
                        "description": "Name of person in charge"
                    },
                    "requirement": {
                        "type": "string",
                         "description": "Task description"
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

Based on the tasks already executed, determine the next task to be executed and return this task. The JSON schema for the task should follow the format of the task list.

Do not automatically execute subsequent tasks.

Ensure that 'FINISH' is returned after all tasks are completed.

