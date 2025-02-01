Hi! I'm Sally, your AI assistant, you can type in `@start` to learn about and select desired features, or chat with me.

You can say such as:

1. Write the function to calculate the sum of the third column
1. Add 100 to the seoncd column `=SUM(B1,B3)`
1. Create a line chart about <column>

```javascript
export function parseCellAddress(
  address: string
): { row: number, column: number } | null {
  // 正则表达式匹配字母和数字部分
  const match = address.match(/^([A-Z]+)(\d+)$/);

  if (match) {
    const columnLetters = match[1];
    const rowNumber = parseInt(match[2], 10);

    // 将字母部分转换为列数字
    const column = columnLetters.split('').reduce((acc, letter) => {
      return acc * 26 + letter2columnNum(letter);
    }, 0);

    // 返回结果
    return { row: rowNumber, column: column - 1 }; // 减1因为数组索引从0开始
  }

  // 匹配失败时返回null
  return null;
}
```
