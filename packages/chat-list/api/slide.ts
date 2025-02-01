import { ISlideService } from "chat-list/types/api/slide";

const funs = [
  'chat',
  'insertTable',
  'insertText',
  'getSelectedText',
  'getDocumentContent',
  'showSidePanel',
  'insertImage',
  'getSelectedImageInfo',
  'generateSlide',
  'createPage'
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

export default obj as ISlideService;
