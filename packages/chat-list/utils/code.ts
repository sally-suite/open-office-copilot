function detectMainFunctionName(code: string) {
    const functionDeclarationRegex = /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/;
    const matches = code.match(functionDeclarationRegex);

    if (matches && matches.length >= 2) {
        // 如果匹配到 main 函数，则返回 'main'
        if (matches[1] === 'main') {
            return 'main';
        }
    }

    // 如果没有匹配到 main 函数，则返回第一个函数的名字
    const firstFunctionNameMatch = code.match(functionDeclarationRegex);
    return firstFunctionNameMatch && firstFunctionNameMatch[1];
}

export const getFunc = (code: string, functionName = 'main') => {
    let name = functionName;
    if (!functionName) {
        name = detectMainFunctionName(code);
    }
    const fun = eval(`(function() {${code}; \n return ${name};})`);
    return fun();
};

export function runScript(code: string) {
    const func = getFunc(code, 'main');
    return func();
}
