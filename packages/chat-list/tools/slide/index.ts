

import translate from 'chat-list/tools/doc/translate';
import writer from 'chat-list/tools/doc/writer';
import formula from 'chat-list/tools/doc/formula';
import uml from 'chat-list/tools/doc/uml';
import common from 'chat-list/tools/common';
import create from 'chat-list/tools/slide/create';
// import pythonInterpreter from 'chat-list/tools/sheet/python';
import { ITool } from 'chat-list/types/plugin';

export const toolList: ITool[][] = [
    common, create
];

export default toolList;