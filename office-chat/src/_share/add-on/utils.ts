

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


/**
 * Transpost Array
 * @param array 
 * @returns 
 */
export function transposeArray(array: string[][]): string[][] {
    var newArray = [];
    for (var i = 0; i < array[0].length; i++) {
        newArray.push([]);
        for (var j = 0; j < array.length; j++) {
            newArray[i].push(array[j][i]);
        }
    }
    return newArray;
}

export function pixelsToPoints(pixels: number) {
    const dpi = 96
    return pixels / (dpi / 72);
}