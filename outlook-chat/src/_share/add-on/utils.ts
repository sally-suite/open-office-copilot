export function columnNum2letter(n) {
    return String.fromCharCode('A'.charCodeAt(0) + n - 1);
}

/**
 * 把字母转成列号，如 H=>7 （从0开始计算以方便数组操作）
 * @param {string} l
 * @return {number}
 * @private
 */
export function letter2columnNum(l) {
    return l.charCodeAt(0) - 'A'.charCodeAt(0) + 1;
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