import { toast } from "sonner"

export type RequestConfig = RequestInit;

export type StreamRequestConfig = RequestInit & { params?: any; data?: any, parseChunk?: (chunkValue: string) => string };

export type StreamCallback = (done: boolean, text: string, abort: () => void) => void;

// 封装请求库
export class Request {
  defaultConfig: RequestInit = {};
  baseUrl!: string;
  token: string | undefined;
  constructor(defaultConfig = {}) {
    this.defaultConfig = defaultConfig;
  }

  // 拦截请求，统一处理异常
  async interceptFetch(url: string, config: RequestConfig) {
    const mergedConfig = {
      ...this.defaultConfig,
      ...config,
      headers: {
        ...this.defaultConfig.headers,
        ...config.headers
      }
    };
    let fullUrl = url;
    if (!url.startsWith('http')) {
      fullUrl = this.baseUrl ? this.baseUrl + url : url;
    }
    if (this.token) {
      mergedConfig.headers = {
        ...mergedConfig.headers,
        Authorization: `Bearer ${this.token}`,
      };
    }
    try {
      const response = await fetch(fullUrl, mergedConfig);

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const res = await response.json();
      if (res.code == 0) {
        return res.data;
      } else {
        throw res;
      }
    } catch (error: any) {
      // 可以在这里处理异常，例如上报错误，显示错误提示等
      toast.error(error.message);
      console.error('Request failed:', error.message);
      throw error;
    }
  }
  async interceptFetchByStream(url: string, config: StreamRequestConfig, callback?: StreamCallback) {
    const mergedConfig = { ...this.defaultConfig, ...config };
    const fullUrl = this.baseUrl ? this.baseUrl + url : url;
    if (this.token) {
      mergedConfig.headers = {
        ...mergedConfig.headers,
        Authorization: `Bearer ${this.token}`,
      };
    }
    try {
      const { parseChunk, ...rest } = mergedConfig;
      const controller = new AbortController();
      const response = await fetch(fullUrl, {
        ...rest,
        method: 'POST',
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = response.body;
      if (!data) {
        return '';
      }
      const reader = data?.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let text = '';
      const stop = () => {
        done = true;
        controller.abort();
      }
      while (!done) {

        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        let chunkValue = decoder.decode(value);
        if (parseChunk) {
          chunkValue = parseChunk(chunkValue);
        }
        text += chunkValue;
        if (callback) {
          callback(done, text, () => {
            stop();
          });
        }
      }

      return text;

    } catch (error: any) {
      // 可以在这里处理异常，例如上报错误，显示错误提示等
      console.error('Request failed:', error.message);
      // throw error;
    }
  }

  // 封装 get 请求
  get(url: string, config = {}) {
    return this.interceptFetch(url, {
      method: 'GET',
      ...config,
    } as RequestConfig);
  }

  // 封装 post 请求
  post(url: string, body = {}, config = {}) {
    return this.interceptFetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
      ...config,
    } as RequestConfig);
  }

  stream(url: string, body = {}, config = {}, callback?: StreamCallback) {
    return this.interceptFetchByStream(url, {
      method: 'POST',
      body: JSON.stringify(body),
      ...config,
    } as RequestConfig, callback);
  }

  // 封装其他请求方法，如 put、delete 等
  // put(url, body = null, config = {}) {}
  // delete(url, config = {}) {}
}

// 示例用法
const defaultConfig = {
  headers: {
    'Content-Type': 'application/json',
  },
  // 可以添加其他默认配置项
};

const request = new Request(defaultConfig);
request.baseUrl = '';
export default request;

// // 发起 GET 请求示例
// request
//   .get('https://api.example.com/data')
//   .then((data) => console.log('GET Response:', data))
//   .catch((error) => console.error('GET Error:', error));

// // 发起 POST 请求示例
// const postData = { name: 'John Doe', age: 30 };
// request
//   .post('https://api.example.com/create', JSON.stringify(postData))
//   .then((data) => console.log('POST Response:', data))
//   .catch((error) => console.error('POST Error:', error));
