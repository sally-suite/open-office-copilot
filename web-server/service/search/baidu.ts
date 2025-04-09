import { ImageItem, ImageSearchResult, SearchResult } from "@/types/search";
import { getPageContent, getSearchapiJson } from "./util";

const SEARCH_NUM = 4;

export const search = async (input: string, apiKey: string): Promise<SearchResult[]> => {
  // 判断input是字符串还是网址，如果是网址，直接获取网页内容，如果是网址，调用search接口，获取网址，然后获取网页内容。
  // 使用正则判断输入是否是网址
  const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
  if (urlRegex.test(input)) {
    // 是网址，直接获取网页内容
    const content = await getPageContent(input);
    return [{
      content: content,
      url: input,
    }];
  } else {
    const result = await getSearchapiJson({
      engine: "baidu",
      api_key: apiKey,
      q: input,
      num: SEARCH_NUM,
    });
    if (result) {
      const organic: any[] = result?.organic_results;
      // 排除pdf,word,excel文件
      const links = organic
        .filter((item) => {
          return !item.link.includes('.pdf') && !item.link.includes('.doc') && !item.link.includes('.xls');
        }).slice(0, SEARCH_NUM);

      const ps = links.map((item) => {
        return getPageContent(item.link);
      })
      const results = await Promise.all(ps);
      return links.map((item, i) => {
        return {
          content: results[i],
          url: item.link,
          title: item.title,
          date: item.date,
          snippet: item.snippet
        }
      })

    } else {
      return []
    }
  }
}

export const searchImages = async (q: string, num = 5): Promise<ImageItem[]> => {
  let data = JSON.stringify({
    "q": q,
    num
  });

  let config = {
    method: 'post',
    url: 'https://google.serper.dev/images',
    headers: {
      'X-API-KEY': "SERPER_API_KEY",
      'Content-Type': 'application/json'
    },
    body: data
  };

  const response = await fetch(config as any)
  const result: ImageSearchResult = await response.json();
  const images = result.images.map((img) => {
    return {
      title: img.title,
      imageUrl: img.imageUrl,
    }
  })
  return images;
};

const provider = {
  search,
  searchImages
}

export default provider;