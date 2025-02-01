
import { ITool } from 'chat-list/types/plugin';
import addChart from './add-chart';
import recommendCharts from './recommend-charts';

export const tools: ITool[] = [
    addChart,
    recommendCharts
];

export default tools;