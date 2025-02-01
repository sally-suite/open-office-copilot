import { IDocService } from "chat-list/types/api/doc";

const funs = [
  'chat',
  'insertTable',
  'insertText',
  'getSelectedText',
  'getDocumentContent'
];

const obj = funs.reduce((pre, cur) => {
  return {
    [cur]: (...args: any[]) =>
      new Promise((resolve, reject) => {
        google.script.run
          .withSuccessHandler((result) => {
            resolve(result);
          })
          .withFailureHandler((error) => {
            reject(error);
          })
        [cur](...args);
      }),
    ...pre,
  };
}, {});

export default obj as IDocService;
