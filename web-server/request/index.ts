import http, { RequestConfig, StreamCallback, StreamRequestConfig } from './request';
import api from './api';

const apiPrefix = '/api';

const objectToQueryString = (obj: any) => {
  const params = new URLSearchParams();
  for (const key in obj) {
    // if (obj.hasOwnProperty(key)) {
    params.append(key, obj[key]);
    // }
  }
  return params.toString();
};
const gen = (option: string) => {
  let url = option;
  let method = 'GET';

  const paramsArray = option.split(' ');
  if (paramsArray.length === 2) {
    method = paramsArray[0];
    url = paramsArray[1];
  }

  if (!url.startsWith('http')) {
    url = apiPrefix + url;
  }

  return function (params: { [x: string]: any }, config?: RequestConfig | StreamRequestConfig, callback?: StreamCallback) {
    let tarUrl = url;
    let body;

    if (method === 'GET') {
      if (params) {
        const queryString = objectToQueryString(params);
        tarUrl = `${url}?${queryString}`;
      }
    } else {
      if (params) {
        body = JSON.stringify(params);
      }
    }

    if (method === 'STREAM') {
      return http.interceptFetchByStream(tarUrl, {
        ...config,
        body,
        method: "POST",
      }, callback);
    }

    return http.interceptFetch(tarUrl, {
      ...config,
      body,
      method,
    });
  };
};

export type IAPIKeys = keyof typeof api;
export type IAPIFunction = {
  [_x in IAPIKeys]: ReturnType<typeof gen>;
};

const APIFunction = {} as IAPIFunction;
for (const key in api) {
  APIFunction[key as IAPIKeys] = gen(api[key as IAPIKeys]);
}

export default APIFunction;
