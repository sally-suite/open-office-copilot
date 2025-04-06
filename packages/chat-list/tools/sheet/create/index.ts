import { ITool } from 'chat-list/types/plugin';
// import createByTable from './create-by-table';
import createByName from './create-by-name';

// import createByData from './create-by-data'
// import createByCondition from './create-by-condition'
export const tools: ITool[] = [
  createByName,
  // createByData,
  // createByCondition
];
export default tools;