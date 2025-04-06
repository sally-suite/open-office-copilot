import React from 'react';
import { ChatPluginBase, IChatPlugin } from 'chat-list/types/plugin';
import { IChatMessage, QuickReplyItem } from 'chat-list/types/message';
import instruction from './prompts/instruction.md';
import description from './prompts/description.md';
import i18n from 'chat-list/locales/i18n';
import RenderUml from 'chat-list/components/render-uml';
import umlPng from 'chat-list/assets/img/flow-chart.png';
// import mark from './mark.txt';

export class UML extends ChatPluginBase implements IChatPlugin {
  name = i18n.t('doc.agent.uml', 'Diagram');
  icon = umlPng;
  action = 'uml';
  shortDescription = i18n.t('doc.agent.uml.short_description', "Help you write UML Diagram.");
  description = description;
  // placeholder = 'Help me write UML Diagram.';
  placeholder = i18n.t('agent:uml_placeholder', "Describe your diagramming needs");
  instruction = instruction;
  introduce = i18n.t('agent:uml_introduction', "Hi! I'm Sally,How can I assist you today?");
  quickReplies = () => {
    return [
      // {
      //   code: 'test',
      //   name: 'test'
      // }
    ];
  };
  onQuickReply = async (item: QuickReplyItem) => {
    // const { appendMsg, setPlugins, plugins } = this.context;
    // appendMsg(this.buildChatMessage(mark, 'text'))
    // docApi.insertText(mark)
  };
  onSend = (input: IChatMessage) => {
    // GPT发送的消息，拦截，自定义一些操作
    return input;
  };
  // tools: any[] = ['insert_text'];
  // onReceive = async (message: IChatMessage) => {
  //   return super.onReceive(message, { stream: false });
  // };
  render = () => {
    return <RenderUml />;
  };
}

export default new UML();
