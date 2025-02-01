import { ITool } from 'chat-list/types/plugin';
// import applyRomptByRow from './apply-prompt-by-row';
import chatWithData from './chat-with-data';
import completeTable from './complete-table';
export const tools: ITool[] = [
  chatWithData, completeTable
];
export default tools;