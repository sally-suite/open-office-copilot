import { ITool } from 'chat-list/types/plugin';
import getValues from './get-values'
import setValues from './set-values'
import getValuesByRange from './get-values-by-range'
// import createByCondition from './create-by-condition'
export const tools: ITool[] = [
    getValuesByRange,
    getValues,
    setValues,
    // createByCondition
];
export default tools;