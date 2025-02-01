import { IChatBody, IChatResult, ICompletionsBody, IMessageBody } from 'chat-list/types/chat';
import { IUserOrderState } from 'chat-list/types/license';
import { IChatWithPromptOptions, IDocService } from 'chat-list/types/api/doc'
import { insertText, insertTable, getSelectedText, registSelectEvent, runScript, insertImage, getDocumentContent, getSelectedImageInfo } from '../add-on/outlook'
import { isProd } from 'chat-list/utils';
import api from './index';

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
  registSelectEvent?: (callback: (text: string) => void) => Promise<void> = registSelectEvent;
  runScript = runScript;

}
export default new SheetServiceMock();