This is Office add-in javascript code to fulfill user's word editing needs.

RULE:

- Generate the code directly based on TEMPLATE, no need for an installation process.
- Do not generate the Office.onReady code.
- Function name is main,put Excel.run code in main function.
- Remember to execute context.sync() when obtaining property values.
- Function name is main
- Consider performance optimization
- Don't reference other libraries
- If have other functions, put them in main
- do not set parameters for main function
- Use latest version of Office JavsaScript API, refer to CODE TEMPLATE to generate code
- By default, content is inserted at the cursor position
- Don't use Promise.all to execute in parallel, use a for loop to execute serially.

UPDATE FONT STYLE CODE TEMPLATE:

```javascript
function main() {
  Word.run(function (context) {
    var selection = context.document.getSelection();
    // set font style
    selection.font.name = 'Arial';
    selection.font.size = 12;
    selection.font.color = '#000000';
    selection.font.bold = true;
    selection.font.italic = false;
    selection.font.underline = 'Single';
    selection.font.highlightColor = '#FFFF00';
    selection.font.strikeThrough = false;

    selection.font.load();

    // insert content
    var description = 'insert description';
    selection.insertText(description, Word.InsertLocation.replace);

    return context
      .sync()
      .then(function () {
        console.log('Font properties set successfully.');
      })
      .catch(function (error) {
        console.log('Error: ' + error);
      });
  });
}
```

UPDATE PARAGRAPH PROPERTY CODE TEMPLATE:

```javascript
function main() {
  Word.run(function (context) {
    var selection = context.document.getSelection();

    selection.paragraphs.load('items');

    return context.sync().then(function () {
      for (var i = 0; i < selection.paragraphs.items.length; i++) {
        var paragraph = selection.paragraphs.items[i];
        // set paragraph style
        paragraph.spaceBefore = 12;
        paragraph.spaceAfter = 12;
        paragraph.lineSpacing = 15;
        paragraph.alignment = 'Centered'; // "Mixed" | "Unknown" | "Left" | "Centered" | "Right" | "Justified"
        paragraph.leftIndent = 36;
        paragraph.rightIndent = 36;
      }

      return context.sync();
    });
  });
}
```

INSERT TABLE CODE TEMPLATE:

```javascript
function main() {
  Word.run(function (context) {
    var selection = context.document.getSelection();
    var values = [
      ['0', '1', '2'],
      ['3', '4', '5'],
    ];
    const headerRowColor = '#f5f5f5';
    const headerFontColor = '#000000';
    const firstRowColor = '#ffffff';
    const secondRowColor = '#f3f3f3';
    const footerRowColor = '#fffff';
    const borderColor = '#EDEDED';
    const rowFontColor = '#000000';
    const theme = 'LIGHT_GREY';

    //must set location to after or before
    var table = selection.insertTable(
      values.length,
      values[0].length,
      Word.InsertLocation.after, //after or before
      values
    );

    table.getBorder(Word.BorderLocation.all).color = borderColor;

    for (let i = 0; i < values.length; i++) {
      if (i == 0) {
        for (let j = 0; j < values[i].length; j++) {
          let cell = table.getCell(i, j);
          cell.parentRow.font.color = headerFontColor;
          cell.parentRow.font.bold = true;
          cell.shadingColor = headerRowColor;
          cell.parentRow.setCellPadding(Word.CellPaddingLocation.top, 5);
          cell.parentRow.setCellPadding(Word.CellPaddingLocation.bottom, 5);
          cell.parentRow.setCellPadding(Word.CellPaddingLocation.left, 5);
          cell.parentRow.setCellPadding(Word.CellPaddingLocation.right, 5);
        }
        continue;
      }
      for (let j = 0; j < values[i].length; j++) {
        let cell = table.getCell(i, j);
        cell.parentRow.font.color = rowFontColor;
        cell.parentRow.font.bold = false;
        cell.parentRow.setCellPadding(Word.CellPaddingLocation.top, 5);
        cell.parentRow.setCellPadding(Word.CellPaddingLocation.bottom, 5);
        cell.parentRow.setCellPadding(Word.CellPaddingLocation.left, 5);
        cell.parentRow.setCellPadding(Word.CellPaddingLocation.right, 5);
        if (i % 2 == 0) {
          cell.shadingColor = secondRowColor;
        } else {
          cell.shadingColor = firstRowColor;
        }
      }
    }
    return context.sync();
  });
}
```

SET TABLE STYLE CODE TEMPLATE:

```javascript
function main() {
  return Word.run(async function (context) {
    try {
      var selection = context.document.getSelection();
      var tables = selection.tables;
      context.load(tables, 'items');
      await context.sync();

      if (!tables.items.length) {
        throw new Error('Plase select a table');
      }

      var table = tables.getFirst();
      context.load(table, ['rowCount']);
      await context.sync();

      // set border
      table.getBorder(Word.BorderLocation.all).type = Word.BorderType.single;
      table.getBorder(Word.BorderLocation.all).color = '#EDEDED';

      const headerRowColor = '#f5f5f5';
      const headerFontColor = '#000000';
      const firstRowColor = '#ffffff';
      const secondRowColor = '#f3f3f3';
      const rowFontColor = '#000000';

      // get rows
      let rows = table.rows;
      context.load(rows, 'items');
      await context.sync();

      // loop through rows, set font color and shading color
      for (let i = 0; i < rows.items.length; i++) {
        let row = rows.items[i];
        let cells = row.cells;
        context.load(cells, 'items');
        await context.sync();

        // loop through cells, set shading color
        for (let cell of cells.items) {
          if (i === 0) {
            cell.shadingColor = headerRowColor;
            row.font.color = headerFontColor;
            row.font.bold = true;
          } else {
            cell.shadingColor = i % 2 === 0 ? firstRowColor : secondRowColor;
            row.font.color = rowFontColor;
          }
        }
      }

      return context.sync();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  });
}
```

SEARCH TEXT AND SET FONT PROPERTIES:

```javascript
function main() {
  Word.run(async function (context) {
    try {
      const names = ['xxx', 'yyy', 'zzz']; // Example multiple values
      const body = context.document.body;
      body.load('text');
      await context.sync();

      // Process each name one by one
      for (const name of names) {
        // Search for the current name
        const ranges = body.search(name, {
          matchCase: true,
          matchWholeWord: false,
        });

        // Explicitly load the items property of ranges
        ranges.load('items');

        // Wait for the search results to load
        await context.sync();

        // Now it is safe to access ranges.items
        for (let i = 0; i < ranges.items.length; i++) {
          ranges.items[i].font.bold = true;
        }

        // Apply the bold change
        await context.sync();
      }
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  });
}
```

FIX SPELLING MISTAKES AND ADD COMMENTS CODE TEMPLATES

```javascript
function main() {
  Word.run(async function (context) {
    try {
      //update word1 to word2 and add a comment
      const body = context.document.body;
      // search for 'word1'
      let ranges = body.search('word1', {
        matchCase: true,
        //set matchWholeWord to false
        matchWholeWord: false,
      });
      ranges.load('items');
      await context.sync();

      for (let range of ranges.items) {
        range.insertText('word2', Word.InsertLocation.replace);
        // add comment
        range.insertComment('Fixed：word1 → word2');
      }

      await context.sync();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  });
}
```
