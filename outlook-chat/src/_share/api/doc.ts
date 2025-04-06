import { IMessageBody } from 'chat-list/types/chat';
import { IChatWithPromptOptions, IDocService } from 'chat-list/types/api/doc'
import {
  insertText, insertTable, getSelectedText, registSelectEvent,
  runScript, insertImage, getDocumentContent, getSelectedImageInfo,
  insertTitle, insertParagraph, openDialog, deselect
} from '../add-on/doc'

class SheetServiceMock implements IDocService {
  insertTable = insertTable;
  insertImage = insertImage;
  insertText = insertText;
  getSelectedText = getSelectedText;
  getDocumentContent = getDocumentContent;
  getSelectedImageInfo = getSelectedImageInfo;
  translateDocByGoogle: (sourceLanguage: string, targetLanguage: string, mode?: 'overwrite' | 'new-sheet') => Promise<string>;
  translateDocByGpt: (sourceLanguage: string, targetLanguage: string, mode?: 'overwrite' | 'new-sheet', style?: string) => Promise<string>;
  chatWithPrompt: (messages: IMessageBody[], options: IChatWithPromptOptions) => Promise<string>;
  registSelectEvent?: (callback: (text: string) => void) => () => void = registSelectEvent;
  runScript = runScript;
  insertTitle = insertTitle;
  insertParagraph = insertParagraph;
  openDialog = openDialog;
  deselect = deselect
}
export default new SheetServiceMock();