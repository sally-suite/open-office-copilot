import { ITool } from 'chat-list/types/plugin';
import createByName from './create-by-table';
// import createByData from './create-by-data'
// import createByCondition from './create-by-condition'
export const tools: ITool[] = [
  createByName,
  // createByData,
  // createByCondition
];
export default tools;