

// import translate from './translate';
import writer from './writer';
// import formula from './formula';
// import uml from './uml';
import common from 'chat-list/tools/common';
import Coder from './coder'
import { ITool } from 'chat-list/types/plugin';
import pythonInterpreter from 'chat-list/tools/sheet/python';

export const toolList: ITool[][] = [
    writer, common, Coder, pythonInterpreter
]

export default toolList;