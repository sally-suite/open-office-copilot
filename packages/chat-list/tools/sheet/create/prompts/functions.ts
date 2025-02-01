
export default function funcs() {
    return [
        {
            "name": "createSheet",
            "description": `create sheet by table name,columns,and options of columns.`,
            "parameters": {
                "type": "object",
                "properties": {
                    "tableName": {
                        "type": "string",
                        "description": "the table name of the sheet"
                    },
                    "columns": {
                        "type": "array",
                        "description": "the columns name array of the sheet",
                        "items": {
                            "type": "string"
                        }
                    },
                    "options": {
                        "type": "object",
                        "description": "the options of column of the sheet,use column name as key,option list as value."
                    }
                },
                "required": [
                    "tableName",
                    "columns",
                    "options"
                ]
            }
        }
    ]
}