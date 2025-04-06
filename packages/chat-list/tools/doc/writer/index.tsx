import { ITool } from 'chat-list/types/plugin';
// import getSelectedText from './get-selected-text';
import getDocument from './get-document-content';
// import generateArticle from './generate_article';
import InsertText from './insert-text';

export const tools: ITool[] = [
  getDocument, InsertText
];

export default tools;