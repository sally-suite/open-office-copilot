import configEn from './en/index.json';
import configZh from './zh/line.json';

const sources = [configEn, configZh];
export const index = sources.reduce((pre, cur) => {
  return pre.concat(Object.keys(cur));
}, []);

export default {
  ...configEn,
  ...configZh,
};

export const chartTypes = Object.values(configEn);
