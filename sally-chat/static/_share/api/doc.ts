// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { IDocService } from 'chat-list/types/api/doc';


class SheetServiceMock implements IDocService {
  insertTable = () => void 0;
  insertImage = () => void 0;
  insertText = () => void 0;
  getSelectedText = () => void 0;
  getDocumentContent = () => void 0;
  getSelectedImageInfo = () => void 0;
  translateDocByGoogle = () => void 0;
  translateDocByGpt = () => void 0;
  chatWithPrompt = () => void 0;
  registSelectEvent = () => void 0;
  runScript = () => void 0;
  deselect = () => void 0;
  insertTitle = () => void 0;
  insertParagraph = () => void 0;
}
export default new SheetServiceMock();