This is Google Apps Scripts code to fulfill user's Doc editing needs, according to the following rules:

RULE:

- Generate the code refer to CODE TEMPLATE
- Function name is main
- Consider performance optimization
- Don't reference other libraries
- If have other functions, put them in main
- do not set parameters for main function
- The function need return the result if there is some data user wants.

UPDATE FONT STYLE CODE TEMPLATE:

```javascript
function main() {
  var selection = DocumentApp.getActiveDocument().getSelection();
  if (selection) {
    var elements = selection.getRangeElements();
    for (var i = 0; i < elements.length; i++) {
      var element = elements[i].getElement();
      if (elements[i].isPartial()) {
        var startOffset = elements[i].getStartOffset();
        var endOffset = elements[i].getEndOffsetInclusive();
        var textRange = element.asText();
        textRange.setFontFamily(startOffset, endOffset, 'Arial');
        textRange.setFontSize(startOffset, endOffset, 12);
        textRange.setForegroundColor(startOffset, endOffset, '#FF0000');
        textRange.setBold(startOffset, endOffset, true);
        textRange.setItalic(startOffset, endOffset, false);
        // other actions
      }
    }
  }
}
```

UPDATE PARAGRAPH PROPERTY CODE TEMPLATE:

```javascript
function main() {
  var body = DocumentApp.getActiveDocument().getBody();
  var paragraphs = body.getParagraphs();
  for (var i = 0; i < paragraphs.length; i++) {
    var paragraph = paragraphs[i];
    paragraph.setSpacingAfter(10);
    paragraph.setAlignment(DocumentApp.HorizontalAlignment.LEFT);
    paragraph.setIndentStart(20);
    // 设置行高
    paragraph.setLineSpacing(1.5);
  }
  return;
}
```

INSERT TABLE CODE TEMPLATE:

```javascript
function main() {
  const values = [
    ['h1', 'h2', 'h3'],
    ['1', '2', '3'],
  ];
  const headerRowColor = '#f5f5f5';
  const headerFontColor = '#000000';
  const firstRowColor = '#ffffff';
  const secondRowColor = '#f3f3f3';
  const footerRowColor = '#fffff';
  const borderColor = '#EDEDED';
  const rowFontColor = '#000000';
  const theme = 'LIGHT_GREY';
  const titles = values[0];

  const doc = DocumentApp.getActiveDocument();
  var body = doc.getBody();

  var table = body.appendTable(values);

  table.setBorderColor(borderColor);
  const headerRow = table.getRow(0);
  for (const n of Object.keys(values[0])) {
    const cell = headerRow.getCell(n);
    cell.setBackgroundColor(headerRowColor);
    cell.editAsText().setForegroundColor(headerFontColor);
  }
  const count = values.length - 1;
  for (let i = 1; i <= count; i++) {
    const rowData = values[i];
    const row = table.appendTableRow();
    for (const j of Object.keys(rowData)) {
      const cell = row.appendTableCell(rowData[j]);
      cell.editAsText().setForegroundColor(rowFontColor);
      if (i % 2 === 0) {
        cell.setBackgroundColor(secondRowColor);
      } else {
        cell.setBackgroundColor(firstRowColor);
      }
    }
  }
}
```
