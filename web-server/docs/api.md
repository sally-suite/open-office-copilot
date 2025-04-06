We provide interfaces that are compatible with the OpenAI API and you can use this API KEY in your application.

## Support APIs

The following interfaces are currently supported:

- /chat/completions
- /embeddings
- /images/generations

## Support Model

- gpt-3.5-turbo
- gpt-4o
- text-embedding-ada-002

## Usage

```python
from openai import OpenAI

client = OpenAI(
    api_key = "Your API Key",
    base_url = "https://www.sally.bot/api/v1"
)

chat_completion = client.chat.completions.create(
    messages=[
        {
            "role": "user",
            "content": "讲个笑话",
        }
    ],
    model="gpt-3.5-turbo",
)
print(chat_completion.choices[0].message.content)
```
