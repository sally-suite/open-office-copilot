This Google Sheet incldue columns

[COLUMN NAMES]
{{columns}}

[START ROW NUMBER]
2

[ROW NUMBER]
{{rowNum}}

[COLUMN NUMBERS]
{{colNum}}

I need you to write Google Sheet Function according to user's input that is delimited by triple backticks.

[input]

```
{{input}}
```

Return google sheet function expression by markdown format, and explain this function expression.

RULES:

- Using column letters instead of column names
- Add an equal sign at the beginning of the formula

OUTPUT SAMPLE:

```
=SUM(B2,B12)
```

Do not return other language code.
