import {
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
  readFileSync,
  writeFileSync,
} from 'fs';
import { join, dirname } from 'path';
// import openai from 'openai';
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: '',
  baseURL: 'https://api.deepbricks.ai/v1/',
});

async function translateContent(content, lng) {
  const prompt = `Translate the following text to ${lng},only output result:\n\n${content}\n\n`;
  const chatCompletion = await client.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'GPT-4o-mini',
  });
  // console.log(JSON.stringify(chatCompletion, null, 2));
  return chatCompletion.choices[0].message.content;
}

const fromLng = 'en-US';
const targetFolder = 'language';

// 修改 translate 函数，接受源文件数组作为参数
async function translate(lng, sourceFiles) {
  for (const sourceFile of sourceFiles) {
    const sourcePath = join('./', 'language', fromLng, sourceFile);
    const targetPath = join('./', targetFolder, lng, sourceFile);

    // 确保目标目录存在
    const targetDir = dirname(targetPath);
    if (!existsSync(targetDir)) {
      mkdirSync(targetDir, { recursive: true });
    }

    console.log(`Start translating ${sourceFile} to ${lng}`);

    // 如果目标文件已存在，则跳过
    // if (existsSync(targetPath)) {
    //   console.log(`${targetPath} already exists, skipping...`);
    //   continue;
    // }

    const sourceContent = readFileSync(sourcePath, 'utf-8');
    const translatedContent = await translateContent(sourceContent, lng);

    writeFileSync(targetPath, translatedContent, 'utf-8');
    console.log(`Finished translating ${sourceFile} to ${lng}`);
  }
}

// 修改 main 函数，允许指定源文件
async function main() {
  const targetLangs = [
    'ar',
    'de',
    'es',
    'fr',
    'ja',
    'ko',
    'vi',
    'zh-CN',
    'zh-TW',
  ];

  // 指定要翻译的源文件
  const sourceFiles = ['agent/eric_introduction.md'];

  for await (const lng of targetLangs) {
    await translate(lng, sourceFiles);
  }
}

main();
