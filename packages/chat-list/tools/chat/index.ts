



import { ITool } from 'chat-list/types/plugin';
import common from 'chat-list/tools/common';
import pythonInterpreter from 'chat-list/tools/sheet/python';
import indicatorTool from 'chat-list/tools/stock/indicators';
import cryptoIndicatorTool from 'chat-list/tools/crypto/indicators';

import docTool from 'chat-list/tools/side/doc';
import slideTool from 'chat-list/tools/side/slide';

export const toolList: ITool[][] = [
    common, pythonInterpreter, docTool, slideTool, indicatorTool, cryptoIndicatorTool
];

export default toolList;