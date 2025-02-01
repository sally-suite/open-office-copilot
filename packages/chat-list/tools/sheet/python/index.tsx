
import { ITool } from 'chat-list/types/plugin';
import python from './python-interpreter';
import pipInstall from './pip-install';
// import caculator from './caculator';
// import editData from './edit-data';
// import createChart from './create-chart'
export const tools: ITool[] = [
  python, pipInstall
];

export default tools;