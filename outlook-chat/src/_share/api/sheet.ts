import { ISheetService, } from 'chat-list/types/api/sheet';
import {
  initSheet, getRowColNum, setFormula, formatTable,
  setDataValidationAfterRow, getValues, getRangeA1Notation,
  setValues, transposeTable, insertImage, showModalDialog, AddChart,
  insertText, insertTable, appendRows, highlightRowsWithColor, clearHighlightRows,
  registSelectEvent, getSheetInfo, runScript, getValuesByRange, setValuesByRange, getActiveRange, createPivotTable, copySheet, activeSheet
} from '../add-on/sheet'

import {
  getUserProperty, setUserProperty
} from '../add-on/user'

class SheetServiceMock implements ISheetService {
  showModalDialog = showModalDialog;
  sleep() {
    return new Promise((resolve) => {
      setTimeout(resolve, 2000);
    });
  }
  initSheet = initSheet;
  formatTable = formatTable;
  AddChart = AddChart;
  setDataValidationAfterRow = setDataValidationAfterRow;
  translateText: (text: string, sourceLanguage: string, targetLanguage: string) => Promise<string> = () => void 0;
  setFormula = setFormula;
  transposeTable = transposeTable;
  getValues = getValues;
  setValues = setValues;
  insertImage = insertImage;
  setUserProperty = setUserProperty;
  getUserProperty = getUserProperty;
  getRowColNum = getRowColNum;
  getRangeA1Notation = getRangeA1Notation;
  insertText = insertText;
  insertTable = insertTable;
  appendRows = appendRows;
  highlightRowsWithColor = highlightRowsWithColor;
  clearHighlightRows = clearHighlightRows;
  registSelectEvent = registSelectEvent;
  runScript = runScript;
  // TODO
  getSheetInfo = getSheetInfo;
  getValuesByRange = getValuesByRange;
  setValuesByRange = setValuesByRange;
  showSidePanel: (name: string, type: string) => Promise<void>;
  getActiveRange = getActiveRange;
  createPivotTable = createPivotTable
  copySheet = copySheet;
  activeSheet = activeSheet;
}

export default new SheetServiceMock();