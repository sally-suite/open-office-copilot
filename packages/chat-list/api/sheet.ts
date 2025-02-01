
import { ISheetService } from "chat-list/types/api/sheet";

const funs = [
  'initSheet',
  'activeSheet',
  'copySheet',
  'AddChart',
  'formatTable',
  'setDataValidationAfterRow',
  'translateText',
  'setFormula',
  'transposeTable',
  'getValues',
  'setValues',
  'insertImage',
  'getRowColNum',
  'getRangeA1Notation',
  'showModalDialog',
  'insertTable',
  'appendRows',
  'insertText',
  'highlightRowsWithColor',
  'clearHighlightRows',
  'runScript',
  'getSheetInfo',
  'getValuesByRange',
  'setValuesByRange',
  'showSidePanel',
  'getActiveRange',
  'createPivotTable'
];

const obj = funs.reduce((pre, cur) => {
  return {
    [cur]: (...args: any[]) =>
      new Promise((resolve, reject) => {
        google.script.run
          .withSuccessHandler((result: any) => {
            resolve(result);
          })
          .withFailureHandler((error: any) => {
            reject(error);
          })
        [cur](...args);
      }),
    ...pre,
  };
}, {});

export default obj as ISheetService;
