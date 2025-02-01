import userApi from '@api/user';


export function setUserConfig(key: string, value: any) {
  window.sessionStorage.setItem(key, JSON.stringify(value));
  return userApi.setUserProperty(key, JSON.stringify(value));
}

export async function getUserConfig(key: string) {
  const cache = window.sessionStorage.getItem(key);
  if (cache) {
    return JSON.parse(cache);
  }

  const config: string = await userApi.getUserProperty(key);
  if (config) {
    window.sessionStorage.setItem(key, config);
  }
  return config ? JSON.parse(config) : null;
}

export interface IConnectionConfig {
  username: string;
  password: string;
  url: string;
}

