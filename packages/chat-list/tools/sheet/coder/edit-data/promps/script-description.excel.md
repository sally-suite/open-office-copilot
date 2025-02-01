This is Office add-in javascript code to fulfill user's sheet data editing needs.

RULE:

- Generate the code directly refer to CODE TEMPLATE, no need for an installation process.
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
- when read values from range, use range.load('values') to load the range values first.

CODE TEMPLATE:

```javascript
function main() {
  return Excel.run(async (context) => {
    // read data from sheet,do not change the code below
    var sheet = context.workbook.worksheets.getActiveWorksheet();
    var range = sheet.getUsedRange();
    range.load('values');
    await context.sync();
    var data = range.values;

    //javascript code for editing data, you need to generate it add here

    //at last  update data to range
    range.values = data;
    await context.sync();
    return context.sync();
  });
}
```
