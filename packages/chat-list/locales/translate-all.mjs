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

const fromLng = 'en-US';
const targetFolder = 'language';

async function translateContent(content, lng) {
  const prompt = `Translate the following text to ${lng},only output result: """\n\n${content}\n\n"""`;
  const chatCompletion = await client.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'GPT-4o-mini',
  });
  // console.log(JSON.stringify(chatCompletion, null, 2));
  return chatCompletion.choices[0].message.content;
}

async function translate(lng) {
  const enUSPath = join('./', 'language', fromLng);
  const targetPath = join('./', targetFolder, lng);

  // 判断目标文件夹是否存在，不存在则创建
  if (!existsSync(join('./', targetFolder))) {
    mkdirSync(join('./', targetFolder));
  }
  if (!existsSync(targetPath)) {
    mkdirSync(targetPath);
  }

  const files = readdirSync(enUSPath);

  for await (const file of files) {
    console.log(`start translae ${file} to ${lng}`);
    // 判断是否为文件夹
    if (statSync(join(enUSPath, file)).isDirectory()) {
      // 获取文件夹下的文件，翻译后保存到新的语言编码目录下
      const subFiles = readdirSync(join(enUSPath, file));
      for await (const subFile of subFiles) {
        const enUSFile = join(enUSPath, file, subFile);
        const targetFile = join(targetPath, file, subFile);
        //如果文件已存在，则跳过
        if (existsSync(targetFile)) {
          continue;
        }
        if (!existsSync(dirname(targetFile))) {
          mkdirSync(dirname(targetFile), { recursive: true });
        }
        const enUSContent = readFileSync(enUSFile, 'utf-8');
        console.log(`start translae ${enUSFile} to ${lng}`);
        const translatedContent = await translateContent(enUSContent, lng);
        writeFileSync(targetFile, translatedContent, 'utf-8');
        console.log(`end translae ${enUSFile} to ${lng}`);
      }
      continue;
    }
    const enUSFile = join(enUSPath, file);
    const targetFile = join(targetPath, file);
    //如果文件已存在，则跳过
    if (existsSync(targetFile)) {
      continue;
    }
    const enUSContent = readFileSync(enUSFile, 'utf-8');
    const translatedContent = await translateContent(enUSContent, lng);

    writeFileSync(targetFile, translatedContent, 'utf-8');
    console.log(`end translae ${file} to ${lng}`);
  }
}

// translate('zh-CN');
async function main() {
  // const result = await translateContent('Hello, how are you?', 'zh-CN');
  // console.log(result);
  const targetLangs = ['ru'];
  for await (const lng of targetLangs) {
    await translate(lng);
  }
}

main();
