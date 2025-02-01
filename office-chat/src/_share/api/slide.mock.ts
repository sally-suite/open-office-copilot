import { IMessageBody } from 'chat-list/types/chat';
import { IChatWithPromptOptions, ISlideService } from 'chat-list/types/api/slide'
import {
  insertText, insertTable, getSelectedText,
  registSelectEvent, runScript, insertImage, getDocumentContent,
  getSelectedImageInfo, createPage, generateSlide, deselect, createCover, createEnd, getSlidesText, getSlides,
  setSpeakerNote, getSelectedSlides, insertSlidesFromBase64, generatePresentation
} from '../add-on/slide'

class SheetServiceMock implements ISlideService {
  showSidePanel: (name: string, type: string) => Promise<void>;
  generateSlide = generateSlide;
  createPage = createPage;
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