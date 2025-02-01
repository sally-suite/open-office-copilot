import { ITool } from 'chat-list/types/plugin';
// import createLayout from './create-layout';
// import generatePpt from './generate_presentation';
import generate_ppt_by_step from 'chat-list/tools/slide/create/generate_ppt_by_step_v3';
// import generate_speaker_notes from './generate_speaker_notes'
// import caclulateByRequirement from './calculate-by-requirement';

export const tools: ITool[] = [
    generate_ppt_by_step
];
export default tools;