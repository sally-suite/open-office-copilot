export function matchTextWithWeight(text: string, input: string) {
  // 定义单词和字符的匹配规则
  const wordRegex = new RegExp('\\b' + input + '\\b', 'gi'); // \b表示单词边界
  const charRegex = new RegExp(input, 'gi');

  // 进行单词匹配并计算匹配权重
  const wordMatches = text.match(wordRegex);
  const wordWeight = wordMatches ? wordMatches.length : 0;

  // 只要有单词匹配，单词匹配的权重就高于字符匹配
  if (wordWeight > 0) {
    return {
      match: true,
      weight: 1,
    };
  }

  // 进行字符匹配并计算匹配权重
  const charMatches = text.match(charRegex);
  const charWeight = charMatches ? charMatches.length : 0;

  // 返回字符匹配的结果
  return {
    match: charWeight > 0,
    weight: 0,
  };
}
