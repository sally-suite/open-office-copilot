import finances from './zh/finances.json';
import hr from './zh/hr.json';
import project from './zh/project.json';
import time from './zh/time.json';

const sources = [finances, hr, project, time];
export const index = sources.reduce((pre, cur) => {
  return pre.concat(Object.keys(cur));
}, []);

export default {
  ...finances,
  ...hr,
  ...project,
  ...time,
};
