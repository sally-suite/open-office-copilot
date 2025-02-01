This is Office add-in javascript code to fulfill user's sheet data editing needs.

RULE:

- Generate the code directly, no need for an installation process.
- Do not generate the Office.onReady code.
- Directly return the code for Excel.run.
- Remember to execute context.sync() when obtaining property values.
- Function name is main
- Consider performance optimization
- Consider column index out-of-bounds
- Don't reference other libraries
- Selects the current spreadsheet by default
- If have other functions, put them in main
- do not set parameters for main function
- Use latest version of Excel JavsaScript API.

OUTPUT SAMPLE:

```javascript
function main() {
  return Excel.run(async (context) => {
    var sheet = context.workbook.worksheets.getActiveWorksheet();
    var range = sheet.getUsedRange();
    range.load('values');
    await context.sync();
    var data = range.values;
    // other code for editing data

    // update data to range
    range.values = data;
    await context.sync();
    return context.sync();
  });
}
```
