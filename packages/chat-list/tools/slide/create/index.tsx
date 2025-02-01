import { ITool } from 'chat-list/types/plugin';
// import createLayout from './create-layout';
// import generatePpt from './generate_presentation';
import generate_ppt_by_step from './generate_ppt_by_step_v3'
import generate_speaker_notes from './generate_speaker_notes'
// import caclulateByRequirement from './calculate-by-requirement';
import python_interpreter_slide from './python-interpreter-slide';
import python_install from 'chat-list/tools/sheet/python/pip-install';
import python_interpreter from 'chat-list/tools/sheet/python/python-interpreter';

import code_interpreter_slide from './code-interpreter-slide';
import optimize_slide from './optimize_slide';

export const tools: ITool[] = [
    generate_ppt_by_step, optimize_slide, generate_speaker_notes, python_interpreter_slide, code_interpreter_slide, python_interpreter, python_install
];

export default tools;