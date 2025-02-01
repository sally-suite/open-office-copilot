import sheetTools from './sheet';
import docTools from './doc';
import chatTools from './chat'
import sideTools from './side'
import slideTools from './slide'
import emailTools from './email'
import { ITool } from 'chat-list/types/plugin';
import i18n from 'chat-list/locales/i18n'
import { snakeToWords } from 'chat-list/utils';
// export const tools = sheetTools.tools;


const map: { [x: string]: ITool[][] } = {
    "sheet": sheetTools,
    "doc": docTools,
    'chat': chatTools,
    'side': sideTools,
    "slide": slideTools,
    'email': emailTools
};

function buildToolList(tools: ITool[][]) {
    return tools.reduce((pre, cur) => {
        return pre.concat(cur)
    }, []).map((tool) => {
        return {
            displayName: i18n.t(`tool:${tool.name}`, {
                ns: 'tool',
                defaultValue: snakeToWords(tool.name)
            }) || snakeToWords(tool.name),
            ...tool
        }
    })
}

function buildTool(toolMap: { [x: string]: ITool[][] }): { [x: string]: ITool[] } {
    const result: { [x: string]: ITool[] } = {}
    // 遍历toolMap的key
    for (const key in toolMap) {
        // 获取对应的value
        const value = toolMap[key];
        result[key] = buildToolList(value);
    }
    return result;
}



export default buildTool(map) as { [x: string]: ITool[] }