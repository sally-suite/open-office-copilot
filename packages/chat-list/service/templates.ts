import config, { index } from 'chat-list/data/templates';
// import { matchTextWithWeight } from 'chat-list/utils/search';
export const search = (input: string) => {
  const text = input.trimEnd();
  const list = text.split(' ').reverse();
  const q = list[0];
  if (!q || q.length <= 1) {
    return [];
  }
  const result = index;
  // .map((name) => {
  //   const result = matchTextWithWeight(name, q);
  //   return {
  //     name,
  //     ...result,
  //   };
  // })
  // .filter((item) => item.match);
  return result.map((item) => {
    return {
      action: '/create',
      name: item.name,
      weight: item.weight,
    };
  });
};

export const getTemplate = (key: string) => {
  const cfx = config as any;
  return cfx[key] || [];
};
