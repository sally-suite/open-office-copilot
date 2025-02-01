import { IChatBody, IChatResult, ICompletionsBody, IMessageBody } from 'chat-list/types/chat';
import { IUserOrderState } from 'chat-list/types/license';
import { IChatWithPromptOptions, IDocService } from 'chat-list/types/api/doc'
import {
  insertText, insertTable, getSelectedText, registSelectEvent, runScript, insertImage, getDocumentContent,
  getSelectedImageInfo, deselect, insertParagraph, insertTitle,
  removeLineBreaks, openDialog, insertFootnote,
} from '../add-on/doc'
import { generateDocumentReferences } from '../add-on/doc-references';


class SheetServiceMock implements IDocService {
  insertTable = insertTable;
  insertImage = insertImage;
  insertText = insertText;
  insertFootnote = insertFootnote;
  generateDocumentReferences = generateDocumentReferences
  getSelectedText = getSelectedText;
  getDocumentContent = getDocumentContent;
  getSelectedImageInfo = getSelectedImageInfo;
  translateDocByGoogle: (sourceLanguage: string, targetLanguage: string, mode?: 'overwrite' | 'new-sheet') => Promise<string>;
  translateDocByGpt: (sourceLanguage: string, targetLanguage: string, mode?: 'overwrite' | 'new-sheet', style?: string) => Promise<string>;
  chatWithPrompt: (messages: IMessageBody[], options: IChatWithPromptOptions) => Promise<string>;
  registSelectEvent?: (callback: (text: string) => void) => Promise<void> = registSelectEvent;
  runScript = runScript;
  deselect = deselect;
  insertTitle = insertTitle;
  insertParagraph = insertParagraph;
  removeLineBreaks = removeLineBreaks;
  openDialog = openDialog;
}
export default new SheetServiceMock();