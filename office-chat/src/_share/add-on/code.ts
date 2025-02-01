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

// 检测代码中是否包含指定函数名
const hasFunctionName = (code: string, functionName: string): boolean => {
  // 使用正则表达式匹配函数声明
  const functionRegex = new RegExp(`function\\s+${functionName}\\s*\\(`);
  const arrowFunctionRegex = new RegExp(`(const|let|var)\\s+${functionName}\\s*=\\s*\\(`);
  return functionRegex.test(code) || arrowFunctionRegex.test(code);
};

// 封装代码到默认函数中
const wrapCodeInDefaultFunction = (code: string): string => {
  return `function main() {
    ${code}
  }`;
};

const initFunc = (code: string, functionName = 'main') => {
  try {
    // 检查是否存在指定函数
    if (!hasFunctionName(code, functionName)) {
      // 如果没有找到指定函数,将代码封装到默认函数中
      code = wrapCodeInDefaultFunction(code);
    }

    const fun = eval(`(function() {
      try {
        ${code};
        return ${functionName};
      } catch (e) {
        throw new Error('Failed to execute code: ' + e.message);
      }
    })`);

    return fun();
  } catch (error) {
    throw new Error(`Failed to initialize function: ${error.message}`);
  }
};

export async function runCode(code: string) {
  try {
    const functionName = detectMainFunctionName(code) || 'main';
    const func = await initFunc(code, functionName);
    return await func();
  } catch (error) {
    throw new Error(`Failed to run code: ${error.message}`);
  }
}