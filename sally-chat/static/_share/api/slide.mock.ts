
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { ISlideService } from 'chat-list/types/api/slide';

class SheetServiceMock implements ISlideService {
  insertTable = () => void 0;
  insertText = () => void 0;
  insertImage = () => void 0;
  getSelectedText = () => void 0;
  getDocumentContent = () => void 0;
  registSelectEvent = () => void 0;
  showSidePanel = () => void 0;
  getSelectedImageInfo = () => void 0;
  generateSlide = () => void 0;
  createPage = () => void 0;
  createCover = () => void 0;
  createEnd = () => void 0;
  deselect = () => void 0;
  getSlidesText = () => void 0;
  getSlides = () => void 0;
  setSpeakerNote = () => void 0;
  getSelectedSlides = () => void 0;


}
export default new SheetServiceMock();