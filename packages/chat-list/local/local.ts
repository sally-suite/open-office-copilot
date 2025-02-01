/* eslint-disable @typescript-eslint/ban-ts-comment */
import { DEFAULT_MODEL } from "chat-list/config/llm";
import { USER_SET_AI_MODEL, USER_SET_AI_PROVIDER, USER_SET_MODEL_API_BASE_URL, USER_SET_MODEL_API_KEY } from "chat-list/config/openai";
import { SHEET_CHAT_FROM_LANG, SHEET_CHAT_TO_LANG, SHEET_CHAT_TRANSLATE_ENGINE } from "chat-list/config/translate";
import { GptModel } from "chat-list/types/chat";
import { ILangItem } from "chat-list/types/translate";
const PREFIX = 'sheet-chat-state';
const PRIVACY_STATE_KEY = 'privacy-state';
const SHEET_CHAT_CHART_ENGINE = 'sheet-chat-chart-engine'
const GPT_LIMIT_NUMBER = 'git-limit-number';
const USER_LICENSE_KEY = 'user-license-key';
export const USER_TOKEN = 'user-token';
export const USER_TOKEN_EXPIRE = 'user-token-expire';
const AGENT_MODEL = 'agent-model';
export const AGENT_TOOL = 'agent-tool';
export const AGENT_AGENT = 'agent-agent';

const memoryStore = {
  cache: new Map(),
  getItem(key: string) {
    return this.cache.get(key)
  },
  setItem(key: string, value: string) {
    this.cache.set(key, value)
  },
  removeItem(key: string) {
    this.cache.delete(key)
  },
}

export const getStateFromLocalStore = (key: string) => {
  const result = window.localStorage.getItem(`${PREFIX}-${key}`);
  if (!result) {
    return null;
  }
  return JSON.parse(result);
};

export const setStateToLocalStore = (key: string, state = {}) => {
  const value = JSON.stringify(state);
  window.localStorage.setItem(`${PREFIX}-${key}`, value);
};

export const clearStateInLocalStore = () => {
  const store = window.localStorage;
  const len = store.length;
  for (let i = 0; i < len; i++) {
    const key = store.key(i);
    if (key.startsWith(PREFIX)) {
      store.removeItem(key);
    }
  }
};


export const setChromeStore = (key: string, value: any = {}) => {
  return new Promise((resolve) => {
    //@ts-ignore
    if (chrome?.storage?.sync) {
      // console.log('getToken', token)
      let val = value;
      if (value == null || typeof value === 'undefined') {
        val = '';
      } else {
        val = JSON.stringify(value);
      }
      //@ts-ignore
      chrome.storage.sync.set({ [key]: val }, () => {
        resolve(null);
      });
    } else {
      setLocalStore(key, value);
      resolve(null);
    }
  })
}


export const setLocalStore = (key: string, value: any = {}) => {
  let localStore: any = window.localStorage;
  if (!localStore) {
    localStore = window.sessionStorage;
  }
  if (!localStore) {
    localStore = memoryStore;
  }
  if (value == null || typeof value === 'undefined' || value == '') {
    localStore?.removeItem(key);
  } else {
    localStore?.setItem(key, JSON.stringify(value));
  }
};

export const getChromeStore = (key: string) => {
  return new Promise((resolve) => {
    //@ts-ignore
    if (chrome?.storage?.sync) {
      // console.log('getToken')
      //@ts-ignore
      chrome.storage.sync.get([key], (result) => {
        // console.log('Value currently is ' + result[USER_TOKEN]);
        const value = result[key] ? JSON.parse(result[key]) : undefined;
        resolve(value)
      });
    } else {
      return resolve(getLocalStore(key) || '');
    }
  })
}
export const getLocalStore = (key: string) => {
  let localStore: any = window.localStorage;
  if (!localStore) {
    localStore = window.sessionStorage;
  }
  if (!localStore) {
    localStore = memoryStore;
  }
  const value = localStore?.getItem(key);
  try {
    return value ? JSON.parse(value) : undefined;
  } catch (e) {
    return undefined;
  }
};

export const setPrivacyState = (value: string) => {
  setLocalStore(PRIVACY_STATE_KEY, value)
}
export const getPrivacyState = (): string => {
  return getLocalStore(PRIVACY_STATE_KEY);
}

export const getChartEngine = () => {
  return getLocalStore(SHEET_CHAT_CHART_ENGINE) || 'google'
}
export const setChartEngine = (engine: 'google' | 'echarts') => {
  return setLocalStore(SHEET_CHAT_CHART_ENGINE, engine)
}

export const getTargetLanguage = () => {
  return getLocalStore(SHEET_CHAT_TO_LANG) || ''
}

export const setTargetLanguage = (lng: ILangItem) => {
  return setLocalStore(SHEET_CHAT_TO_LANG, lng)
}

export const getSourceLanguage = () => {
  return getLocalStore(SHEET_CHAT_FROM_LANG) || ''
}

export const setSourceLanguage = (lng: ILangItem) => {
  return setLocalStore(SHEET_CHAT_FROM_LANG, lng)
}

export const getTranslateEngine = () => {
  return getLocalStore(SHEET_CHAT_TRANSLATE_ENGINE) || ''
}

export const setTranslateEngine = (engine: string) => {
  return setLocalStore(SHEET_CHAT_TRANSLATE_ENGINE, engine)
}


export const setLicenseConfig = (value: string) => {
  return setLocalStore(USER_LICENSE_KEY, value);
};

export const getLicenseConfig = () => {
  return getLocalStore(USER_LICENSE_KEY);
};

export const getToken = async () => {
  return getLocalStore(USER_TOKEN) || '';
}

export const setToken = async (token: string) => {
  await setTokenExpireTime(Date.now() + 60 * 60 * 24 * 4 * 1000);
  return setLocalStore(USER_TOKEN, token);
}

export const getTokenExpireTime = async (): Promise<number> => {
  const time = getLocalStore(USER_TOKEN_EXPIRE) || 0;
  if (time) {
    return Number(time)
  }
  return time;
}

export const setTokenExpireTime = async (time: number) => {
  return setLocalStore(USER_TOKEN_EXPIRE, time);
}

export const getAgentModel = (name: string) => {
  return getLocalStore(`${AGENT_MODEL}_${name}`) || '';
}

export const setAgentModel = (name: string, model: string) => {
  return setLocalStore(`${AGENT_MODEL}_${name}`, model);
}

export const getAgentTools = (name: string) => {
  return getLocalStore(`${AGENT_TOOL}_${name}`) || '';
}

export const setAgentTools = (name: string, tools: string[]) => {
  return setLocalStore(`${AGENT_TOOL}_${name}`, tools);
}

export const getColAgents = (name: string) => {
  return getLocalStore(`${AGENT_AGENT}_${name}`) || '';
}

export const setColAgents = (name: string, tools: string[]) => {
  return setLocalStore(`${AGENT_AGENT}_${name}`, tools);
}


export const setModel = async (model: string) => {
  // USER_SET_AI_MODEL
  return setLocalStore(USER_SET_AI_MODEL, model);
}
export const getModel = async () => {
  return getLocalStore(USER_SET_AI_MODEL) || DEFAULT_MODEL;
}

export const setProvider = async (provider: string) => {
  return setLocalStore(USER_SET_AI_PROVIDER, provider);
}
export const getProvider = async () => {
  return getLocalStore(USER_SET_AI_PROVIDER) || '';
}

export const getApiKey = async (provider: string) => {
  return await getLocalStore(`${USER_SET_MODEL_API_KEY}_${provider}`);
}

export const setApiKey = async (provider: string, apiKey: string) => {
  return await setLocalStore(`${USER_SET_MODEL_API_KEY}_${provider}`, apiKey);
}

export async function getApiConfig(model?: string, provider?: string) {
  const tarModel = model || getLocalStore(USER_SET_AI_MODEL) || DEFAULT_MODEL;
  const tarProvider = provider || getLocalStore(USER_SET_AI_PROVIDER) || '';
  const apiLocalKey = tarProvider ? `${USER_SET_MODEL_API_KEY}_${tarModel}_${tarProvider}` : `${USER_SET_MODEL_API_KEY}_${tarModel}`;
  const apiBaseUrlKey = tarProvider ? `${USER_SET_MODEL_API_BASE_URL}_${tarModel}_${tarProvider}` : `${USER_SET_MODEL_API_BASE_URL}_${tarModel}`;

  const apiHost = getLocalStore(apiBaseUrlKey) || 'https://api.openai.com/v1'
  const apiKey = getLocalStore(apiLocalKey)
  const clear = async () => {
    setLocalStore(apiLocalKey, '');
    setLocalStore(apiBaseUrlKey, '');
  }
  return {
    model: tarModel, apiKey, apiHost, clear
  }
}

export const setApiConfig = async (model: string, apiKey: string, baseUrl: string, provider = '') => {
  const apiLocalKey = provider ? `${USER_SET_MODEL_API_KEY}_${model}_${provider}` : `${USER_SET_MODEL_API_KEY}_${model}`;
  const apiBaseUrlKey = provider ? `${USER_SET_MODEL_API_BASE_URL}_${model}_${provider}` : `${USER_SET_MODEL_API_BASE_URL}_${model}`;
  if (apiKey) {
    setLocalStore(apiLocalKey, apiKey)
  } else {
    setLocalStore(apiLocalKey, '')
  }
  if (baseUrl) {
    setLocalStore(apiBaseUrlKey, baseUrl)
  } else {
    setLocalStore(apiBaseUrlKey, '')
  }
}