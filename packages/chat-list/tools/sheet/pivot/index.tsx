
import { ITool } from 'chat-list/types/plugin';
import createPivotTable from './create-pivot-table';
export const tools: ITool[] = [
  createPivotTable
];

export default tools;