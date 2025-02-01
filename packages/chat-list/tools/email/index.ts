

import writer from './writer';
import common from 'chat-list/tools/common';

import { ITool } from 'chat-list/types/plugin';

export const toolList: ITool[][] = [
    writer, common
]

export default toolList;