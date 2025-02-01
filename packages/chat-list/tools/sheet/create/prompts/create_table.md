# Table Creation Prompt

Please create a table based on the following requirements:

{{table_requirements}}

Refer to the table below for guidance:

{{refer_table}}

Output the table json data in the following schema:

```json
{
  "type": "object",
  "properties": {
    "table_name": {
      "type": "string",
      "description": "Table name"
    },
    "table_headers": {
      "type": "array",
      "description": "Table headers",
      "items": {
        "type": "string"
      }
    },
    "table_rows": {
      "type": "array",
      "description": "Table rows, if no data rows then return at least five rows of sample data",
      "items": {
        "type": "array",
        "items": {
          "type": "string"
        }
      }
    },
    "table_column_options": {
      "type": "array",
      "description": "Table column options, if no options then return empty array.",
      "items": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string",
            "description": "Column header name"
          },
          "options": {
            "type": "array",
            "description": "Column options",
            "items": {
              "type": "string"
            }
          }
        }
      }
    }
  },
  "required": [
    "table_name",
    "table_headers",
    "table_rows",
    "table_column_options"
  ]
}
```
