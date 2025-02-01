import { ITool } from 'chat-list/types/plugin';
import getEmailHistory from './get-email-content';
import WriteEmail from './write-email'

export const tools: ITool[] = [
  getEmailHistory, WriteEmail
];

export default tools;