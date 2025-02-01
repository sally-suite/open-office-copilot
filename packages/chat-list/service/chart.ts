import { ChartTypes } from 'chat-list/types/chart';
// import { matchTextWithWeight } from 'chat-list/utils/search';

export const search = (input: string) => {
  // const text = input.trimEnd();
  // const list = text.split(' ').reverse();
  // const q = list[0];
  // if (!q || q.length <= 1) {
  return ChartTypes.map((name) => {
    return {
      action: '/chart',
      // icon: config[name as keyType].icon,
      name: name,
      weight: 0,
    };
  });
  // }
  // const result = ChartTypes
  //   .map((name) => {
  //     const result = matchTextWithWeight(name, q);
  //     return {
  //       name,
  //       ...result,
  //     };
  //   })
  //   .filter((item) => item.match);
  // return result.map((item) => {
  //   return {
  //     action: '/chart',
  //     name: item.name,
  //     weight: item.weight,
  //   };
  // });
};
