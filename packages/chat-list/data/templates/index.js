import configEn, { index as en } from './en';
import configZh, { index as zh } from './zh';

export const index = en.concat(zh);

export default {
  ...configEn,
  ...configZh,
};
