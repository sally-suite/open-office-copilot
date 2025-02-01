Hello! I'm Sally, your AI assistant. Feel free to chat with me or let me assist you with tasks like:

1. Help me create a task list
1. Write a function to compute the sum of <column>
1. Create a line chart for the <column> data
1. Filter out rows where the <column> is greater than 50
1. Add 100 to B2:B10 cell value
1. **@Analyst** Generate a data analysis report
1. **@Other Agent** help you with <question>

Or,you can use custom function **SALLY_ASK** in **Cell**, such as

1. `=SALLY_ASK("What's your name?")`
1. `=SALLY_ASK(A1,B1,"Your question")`

```python
# import pacakages

def main():
    file_path = '/input/data.xlsx'
    # read data from data.xlsx

    # other code

    output_file = '/output/<name>.<xlsx/png/json/text>'
    # write execute result to output_file

```

```javascript
function main() {
  return Excel.run(async (context) => {
    var sheet = context.workbook.worksheets.getActiveWorksheet();
    var range = sheet.getRange('C2:C6');
    range.load('values');
    await context.sync();
    var data = range.values;
    for (var i = 0; i < data.length; i++) {
      data[i][0] = data[i][0] + 1;
    }
    range.values = data;
    await context.sync();
    return context.sync();
  });
}
```
