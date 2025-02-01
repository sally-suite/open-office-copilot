Please help me generate the layout code for PPT content, with the following requirements:

1. Present the structure of elements in JSON format. Each element should include attributes such as `type`, `top`, `left`, `width`, and `height`.
2. Elements should be absolutely positioned relative to the top-left corner.
3. Element types include `title`, `list`, `image`, and `text`.
4. Elements should not overlap; a proper layout is required.

OUTPUT STRUCTURE：

```json
{
  "elements": [
    {
      "type": "title",
      "top": 50,
      "left": 50,
      "width": 600,
      "height": 80,
      "text": "标题"
    },
    {
      "type": "text",
      "top": 150,
      "left": 50,
      "width": 600,
      "height": 200,
      "text": "文本"
    }
  ]
}
```

USER INPUT:
{{user_input}}
