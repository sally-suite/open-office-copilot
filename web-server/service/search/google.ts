import { ImageItem, ImageSearchResult, PaperItem, SearchResult } from "@/types/search";
import { SERPER_API_KEY } from '@/constants/search';
import { getPageContent, getSearchapiJson } from './util';

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
      engine: "google",
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

export interface INewsResult {
  title: string;
  link: string;
  content: string;
  snippet: string;
  date: string;
  source: string;
  imageUrl: string;
  position: number;
}

export const searchNews = async (input: string): Promise<SearchResult[]> => {
  const result = await searchNewsByGoogle(input);
  if (result) {
    const news: any[] = result;
    try {
      const links = news.slice(0, 3);
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
    } catch (e) {
      return result.slice(0, 5).map((item) => {
        return {
          content: item.snippet,
          url: item.link,
          title: item.title,
          date: item.date,
          snippet: item.snippet,
        }
      })
    }
    // console.log(results)
  } else {
    return []
  }
}

export const searchNewsByGoogle = async (q: string): Promise<INewsResult[]> => {
  let data = JSON.stringify({
    "q": q
  });

  let config = {
    method: 'post',
    url: 'https://google.serper.dev/news',
    headers: {
      'X-API-KEY': SERPER_API_KEY,
      'Content-Type': 'application/json'
    },
    body: data
  };

  const response = await fetch(config as any)
  const result = await response.json();
  return result?.news || [];
};

export const searchImages = async (q: string, num = 5, apiKey?: string): Promise<ImageItem[]> => {

  const result = await getSearchapiJson({
    engine: "google_images",
    api_key: apiKey,
    q: q,
    num,
  })
  // const result: ImageSearchResult = await response.json();
  const images = result.images.map((img) => {
    return {
      title: img.title,
      imageUrl: img.original.link,
    }
  })
  return images;
};

export const searchPapers = async (q: string): Promise<PaperItem[]> => {
  let data = JSON.stringify({
    "q": q
  });

  let config = {
    method: 'post',
    url: 'https://google.serper.dev/scholar',
    headers: {
      'X-API-KEY': SERPER_API_KEY,
      'Content-Type': 'application/json'
    },
    body: data
  };

  const response = await fetch(config as any)
  const result = await response.json();
  if (result?.organic) {
    return result.organic;
  }
  return [];
}

const provider = {
  search,
  searchImages
}

export default provider;