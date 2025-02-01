import { ChatPluginBase, IChatPlugin } from 'chat-list/types/plugin';
import { IChatMessage } from 'chat-list/types/message';
import i18n from 'chat-list/locales/i18n';
import instruction from './prompt/instruction.md';
// import introduction from './prompt/introduction.md'
import paperPng from 'chat-list/assets/img/latex.png';

export class Latex extends ChatPluginBase implements IChatPlugin {
    name = 'LaTeX';
    icon = paperPng;
    // model = null;
    action = "latex";
    mode = 'chat';
    placeholder = i18n.t('agent:latex_placeholder', "Ask me about your research topics or papers!");
    introduce = i18n.t('agent:latex_introduction', 'You are now a professional academic paper writing assistant.');
    instruction = instruction;
    fileConfig = {
        accept: {
            text: true,
            image: true,
            xlsx: false,
        },
        maxSize: 2 * 1014 * 1024,
        maxFiles: 1,
        multiple: false,
    };
    onSend = (input: IChatMessage) => {
        // 用户发送的消息，拦截，自定义一些操作
        return input;
    };
    tools: any[] = [];
    agents: any[] = [];
}

export default new Latex();
