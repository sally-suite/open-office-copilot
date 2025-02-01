




import common from 'chat-list/tools/common';
// import docTool from 'chat-list/tools/doc/writer';
import slideTool from 'chat-list/tools/side/slide'
// import wordTool from 'chat-list/tools/side/doc'

// import pythonInterpreter from 'chat-list/tools/sheet/python';
import stockIndicatorTool from 'chat-list/tools/stock/indicators'
import cryptoIndicatorTool from 'chat-list/tools/crypto/indicators'
import { ITool } from 'chat-list/types/plugin';
import docTool from 'chat-list/tools/side/doc'
import webPageTool from './web-page';


export const toolList: ITool[][] = [
    common, webPageTool, docTool, slideTool, stockIndicatorTool, cryptoIndicatorTool
]

export default toolList;