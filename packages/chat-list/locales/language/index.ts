// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck

// 创建一个上下文，匹配 locales 目录下所有的 JSON 文件
// eslint-disable-next-line no-undef
function loadLanguageAsync() {
  const context = require.context('./', true, /\.json$|\.md$/);

  // 获取所有匹配的文件路径
  const keys = context.keys();
  const languageFiles = keys.reduce((pre, key: string) => {
    const content = context(key);
    if (key.endsWith('.md')) {
      const names = key.replace('./', '').replace('.md', '').split('/');
      const lng = names[0];
      const ns = names[1];
      const k = names[2];
      const obj = pre[lng];
      if (obj) {
        if (obj[ns]) {
          return {
            ...pre,
            [lng]: {
              ...obj,
              [ns]: {
                ...obj[ns],
                [k]: content.default,
              },
            },
          };
        }
        return {
          ...pre,
          [lng]: {
            ...obj,
            [ns]: {
              [k]: content.default,
            },
          },
        };
      }
      return {
        ...pre,
        [lng]: {
          [ns]: {
            [k]: content.default,
          },
        },
      };

    } else if (key.endsWith('.json')) {
      // 获取文件名，可以根据实际需要进行调整
      const names = key
        .replace('./', '')
        .replace(/\.json/, '')
        .split('/');
      //   console.log(fileName);

      const lng = names[0];
      const ns = names[1];
      const obj = pre[lng];
      if (obj) {
        return {
          ...pre,
          [lng]: {
            ...obj,
            [ns]: content,
          },
        };
      }
      return {
        ...pre,
        [lng]: {
          [ns]: content,
        },
      };
    }

  }, {});
  return languageFiles;
}

const languageSet = loadLanguageAsync();
export default languageSet
