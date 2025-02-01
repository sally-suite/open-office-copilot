import { ITool } from 'chat-list/types/plugin';
// import createLayout from './create-layout';
// import generatePpt from './generate_presentation';
import generate_doc_by_step from './generate_doc_for_download'
// import getSelectedText from 'chat-list/tools/doc/writer/get-selected-text'
import improveWriting from 'chat-list/tools/doc/writer/improve-writing'
// import generate_speaker_notes from './generate_speaker_notes'
// import caclulateByRequirement from './calculate-by-requirement';

export const tools: ITool[] = [
    improveWriting, generate_doc_by_step
];
export default tools;