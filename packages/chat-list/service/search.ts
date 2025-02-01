/* eslint-disable @typescript-eslint/no-this-alias */
// 创建一个 Lunr.js 索引

import { chunkText } from 'chat-list/utils/file';
import lunr from 'lunr';

// let index;
// export const createIndex = () => {
//   lunr(function () {
//     this.field('title');
//     this.field('content');
//     // 添加要索引的其他字段
//     idx = this;
//   });
//   return idx;
// }


let store: any;
let idx: any;
export const buildStore = () => {
  if (store) {
    return store;
  }
  idx = lunr(function () {
    this.ref('name');
    this.field('content');
    store = this;
  });
  return store;
};

export const addIndex = (name: string, chunks: any[]) => {
  // 添加文档到索引
  const store = buildStore();
  chunks.forEach((content, i) => {
    store.add({
      name: name + i,
      content
    });
  });
  // 
};

export const search = (keyword: string, content: string) => {
  // 执行搜索
  const chunks = chunkText(content, 1000);
  const idx = lunr(function () {
    this.ref('id');
    this.field('content');
    chunks.forEach((content, i) => {
      this.add({
        id: i,
        content
      });
    });
  });
  const results: any[] = idx.search(keyword);
  const list = results.slice(0, 3).map((p: any) => chunks[p.ref]);
  return list.join('\n');
};





