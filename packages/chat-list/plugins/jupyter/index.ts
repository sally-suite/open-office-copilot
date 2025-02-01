import { ChatPluginBase, IChatPlugin } from "chat-list/types/plugin";
// import { tools } from 'chat-list/tools/sheet/coder';
import i18n from 'chat-list/locales/i18n';
import avatarPng from 'chat-list/assets/img/jupyter-32.png';

/**
 * Code generation and run it in Google Apps Script
 */
export class Code extends ChatPluginBase implements IChatPlugin {
    name = i18n.t('agent.jupyter', 'Analysis Note');
    icon = avatarPng;
    // model = null;
    mode = 'custom';
    action = "jupyter";
    placeholder = i18n.t('agent.jupyter.placeholder', 'Input your data analysis request');
    shortDescription = i18n.t('agent.jupyter.short_description', "A lightweight AI-based Jupiter notebook.");
    description = '';
    instruction = '';
    introduce = '';
}

export default new Code();
