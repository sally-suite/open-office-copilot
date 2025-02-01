import { ITool } from 'chat-list/types/plugin';
// import createLayout from './create-layout';
import generatePpt from './generate_presentation';
// import caclulateByRequirement from './calculate-by-requirement';

export const tools: ITool[] = [
    generatePpt
];
export default tools;