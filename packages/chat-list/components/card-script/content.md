function updateValues() {
// Get the current spreadsheet.
const spreadsheet = SpreadsheetApp.getActiveSheet();

// Get the range of cells B2:B11.
const range = spreadsheet.getRange('B2:B11');

// Set the values of the cells to 100.
range.setValues([[100], [100], [100], [100], [100], [100], [100], [100], [100], [100]]);
}
