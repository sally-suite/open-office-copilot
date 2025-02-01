import { IMessageBody } from 'chat-list/types/chat';
import { IChatWithPromptOptions, ISlideService } from 'chat-list/types/api/slide'
import {
  insertText, insertTable, getSelectedText, registSelectEvent, runScript, insertImage,
  getDocumentContent, getSelectedImageInfo, createPage, createCover, createEnd, getSlidesText, setSpeakerNote,
  generateSlide, deselect, getSlides, getSelectedSlides, insertSlidesFromBase64, generatePresentation
} from '../add-on/slide'

class SheetServiceMock implements ISlideService {
  showSidePanel: (name: string, type: string) => Promise<void>;
  generateSlide = generateSlide;
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
  createPage = createPage;
  runScript = runScript;
  deselect = deselect;
  createCover = createCover;
  createEnd = createEnd;
  getSlidesText = getSlidesText;
  getSlides = getSlides;
  setSpeakerNote = setSpeakerNote;
  getSelectedSlides = getSelectedSlides;
  insertSlidesFromBase64 = insertSlidesFromBase64;
  generatePresentation = generatePresentation
}
export default new SheetServiceMock();