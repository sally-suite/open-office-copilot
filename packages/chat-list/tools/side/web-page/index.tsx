import { ITool } from 'chat-list/types/plugin';
import getPageContent from './get_page_content';
import getSelectText from './get_page_selected_text';

export const tools: ITool[] = [
  getPageContent,
  getSelectText
];

export default tools;