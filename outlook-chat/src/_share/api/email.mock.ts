import { IEmailService } from 'chat-list/types/api/email'

import {
  insertText,
  insertTable,
  getSelectedText,
  registSelectEvent,
  runScript, insertImage,
  getDocumentContent,
  getSelectedImageInfo,
  setSubject,
  setBody,
  setToRecipients,
  setCCRecipients,
  setBCCRecipients,
  openDialog
} from '../add-on/outlook'


class EmailServiceMock implements IEmailService {
  insertTable = insertTable;
  insertImage = insertImage;
  insertText = insertText;
  getSelectedText = getSelectedText;
  getDocumentContent = getDocumentContent;
  getSelectedImageInfo = getSelectedImageInfo;
  registSelectEvent = registSelectEvent;
  runScript = runScript;
  setSubject = setSubject;
  setBody = setBody;
  setToRecipients = setToRecipients;
  setCCRecipients = setCCRecipients;
  setBCCRecipients = setBCCRecipients;
  openDialog = openDialog;
}

export default new EmailServiceMock();