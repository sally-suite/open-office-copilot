export const isEmpty = (rows: string[][][] | string[][]) => {
  return rows.every((row) => {
    return row.every((item) => {
      if (Array.isArray(item)) {
        return item.every((p) => !p);
      } else {
        return !item;
      }
    });
  });
};

export const incldueFirstLine = (rows: string[]) => {
  const rowStart = rows[0].split(':')[0];
  if (rows.length === 1 && rowStart == 'A1') return true;
  return false;
};

/**
 * 把列号码转成字母，如 27 => AA （从0开始计算以方便数组操作）
 * @param {number} n
 * @return {string}
 * @private
 */
export function columnNum2letter(n: number): string {
  let result = '';
  while (n >= 0) {
    result = String.fromCharCode((n % 26) + 'A'.charCodeAt(0)) + result;
    n = Math.floor(n / 26) - 1;
  }
  return result;
}

/**
 * 把字母转成列号，如 AA => 27 （从0开始计算以方便数组操作）
 * @param {string} l
 * @return {number}
 * @private
 */
export function letter2columnNum(l: string): number {
  let result = 0;
  for (let i = 0; i < l.length; i++) {
    result = result * 26 + (l.charCodeAt(i) - 'A'.charCodeAt(0) + 1);
  }
  return result - 1;
}

export function parseCellAddress(address: string): { row: number, column: number } | null {
  // 判断如果只是字母
  if (/^[A-Z]+$/.test(address)) {
    return { row: undefined, column: letter2columnNum(address) + 1 };
  }
  // 判断如果只是数字
  if (/^\d+$/.test(address)) {
    return { row: parseInt(address, 10), column: undefined };
  }

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
    return { row: rowNumber, column: column + 1 };
  }

  // 匹配失败时返回null
  return null;
}

export function numberToLetter(i: number) {
  if (i - 1 < 0) {
    return "";
  }
  const m = (i - 1) % 26; //1
  const v = (i - 1) / 26; //1.11
  let pre = "";
  if (v >= 1) {
    pre = numberToLetter(Number(v.toFixed(0)));
  }
  const char = columnNum2letter(m);
  return pre + char;
}
