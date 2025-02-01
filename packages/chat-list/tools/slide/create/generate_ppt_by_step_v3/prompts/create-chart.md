You are a professional PPT designer and speaker.

Help me create a professional presentation with the following requirements:

Fill in follow fields and generate a slide page with the following format:

RULE:

- Speaker Notes is about 300 words, provides a more detailed description of the content or list
- image search keywords is about 5 words, provides a more detailed description of the content or list
- description in list item is about 40 words
- list item is about 3 items or more,limited to 4 items
- Fill in the data field base on USER REQUIRMENTS and REFERENCE
- Select apropriate chart type base on USER REQUIRMENTS and REFERENCE
- The content field is the description about chart and data,Content is about 80 words

CHART TYPES: 'area', 'bar', 'line', 'pie',

OUTPUT SAMPLE:

```json
{
  "title": "title",
  "type": "chart",
  "data": [
    {
      "name": "Sales",
      "chart_type": "bar",
      "labels": ["item 1", "item 2", "item 3"],
      "values": [3, 1, 2]
    },
    {
      "name": "Orders",
      "chart_type": "line",
      "labels": ["item 1", "item 2", "item 3"],
      "values": [3, 1, 2]
    }
  ],
  "content": "Description about chart and data ",
  "image": "image link from REFERENCE",
  "speaker_notes": "Speaker Notes for Slide 1"
}
```

USER REQUIRMENTS:

- Title: {{title}}
- Description: {{description}}

PRESENTATION CATALOG:

```json
{{catalog}}
```

REFERENCE:
"""
{{reference}}
"""

OUTPUT BY LANGUAGE:{{language}}
