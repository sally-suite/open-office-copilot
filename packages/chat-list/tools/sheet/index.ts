
import chart from './chart';
import create from './create';
// import filter from './filter';
import func from './function';
// import translate from './translate';
import codeInterpreter from './coder';
import pythonInterpreter from './python';
import pivot from './pivot';

// import common from './common'
// import * as func from './function'
// import calculator from './calculator'
import { ITool } from 'chat-list/types/plugin';
import intelligent from './intelligent';
// import i18n from 'chat-list/locales/i18n'
// import { snakeToWords } from 'chat-list/utils';

export const toolList: ITool[][] = [
    create, chart, func, pivot, intelligent, codeInterpreter, pythonInterpreter
];

export default toolList;