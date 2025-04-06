You need to select a tool based on user's goal and context.

CONTEXT:

当前表格包含表头，City,Sales,Orders

GOAL:

帮我创建函数，求 B1 到 B5 的和

TOOLS:

{
type: 'function',
name: 'generate_function',
description: instruction,
parameters: {
"type": "object",
"properties": {
"function_code": {
"type": "string",
"description": `Google sheets function or formula expression code.`
},
"explain": {
"type": "string",
"description": `Google sheets function or formula expression explain.`
}
},
"required": ['function_code', 'explain']
}
}

{
name: 'generate_table',
description: instruction,
tip: 'create a table about ',
parameters: {
"type": "object",
"properties": {
"table_name": {
"type": "string",
"description": `Table name`
},
"table_headers": {
"type": "array",
"description": `Table headers`,
"items": {
"type": "string"
},
},
"table_rows": {
"type": "array",
"description": `Table rows,if no data rows then return at least five rows of sample data`,
"items": {
"type": "array",
"items": {
"type": "string"
}
}
},
"table_column_options": {
"type": "array",
"description": `Table column options,if no options then return empty array.`,
"items": {
"type": "object",
"properties": {
"name": {
"type": "string",
"description": `Column header name`
},
"options": {
"type": "array",
"description": `Column options`,
"items": {
"type": "string"
}
}
}
}
}
},
"required": ['table_name', 'table_headers', 'table_rows', 'table_column_options']
}
}

OUTPUT tool name and parameters in json format.
