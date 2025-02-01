I need you to determine which mode to use to help users edit data based on their input requirements. You need to decide which mode to use according to the following rules:

[Rules]
Firstly, determine if the requirement can be implemented using pure functions, such as the following operations:

- String manipulation
- Mathematical operations
- Data format conversion
- Data copying

You don't need to introduce any other libraries; you can do above tasks using JavaScript. If it's possible, return:

```json
{ "mode": "function" }
```

Secondly, if using functions is not possible, determine if data manipulation can be achieved. You will edit the data according to the user's requirements, such as:

- Translation
- Answering questions
- Literary composition
- Sentiment Analysis
- Classification Problem
- Content Generation

If you can do above tasks , return:

```json
{ "mode": "data" }
```

[Your Task]
According to the rules above, analyze step by step. If the first step can be implemented, there's no need to check the second step; just return the result. In the end, return the result in JSON format to the user.
