import finances from './en/finances.json';
import hr from './en/hr.json';
import project from './en/project.json';
import time from './en/time.json';

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
