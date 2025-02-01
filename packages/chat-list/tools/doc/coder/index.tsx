// import { ToolFunction } from 'chat-list/types/chat';
// import calculator from './calculator';
// import chart from './chart';
// import create from './create';
// import filter from './filter';
// import func from './function';
// import translate from './translate';
// import coder from './coder'
import { ITool } from 'chat-list/types/plugin';
import runScript from './code-interpreter'
export const tools: ITool[] = [
  runScript
];
export default tools;
// export const toolMap = toolList.reduce((acc, tool) => {
//     if (tool.name) {
//         acc[tool.name] = tool.func;
//     }
//     return acc;
// }, {} as Record<string, any>);


// export const tools: ToolFunction[] = toolList.map(({ name, description, parameters, func }) => {
//     return {
//         type: 'function',
//         function: {
//             name,
//             description,
//             parameters
//         },
//         func
//     }
// })