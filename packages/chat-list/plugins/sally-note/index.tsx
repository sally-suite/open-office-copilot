import { QuickReplyItem } from 'chat-list/types/message';
import { ChatPluginBase, IChatPlugin } from 'chat-list/types/plugin';
import { IChatMessage } from 'chat-list/types/message';
import CardTranslate from 'chat-list/components/card-translate-doc';
import React from 'react';
import promptSetting from './prompt';
import docApi from '@api/doc';
import { capitalizeFirstLetter } from 'chat-list/utils';
import i18n from 'chat-list/locales/i18n';
import instruction from './prompt/instruction.md';
import { t } from 'i18next';
// import SallyAvatar from 'chat-list/components/avatars/sally'
import sallyPng from 'chat-list/assets/img/sally-32.png';
import CardIntroduce from 'chat-list/components/card-introduce/index.doc';
// import introduction from './prompt/introduction.md'

export class Start extends ChatPluginBase implements IChatPlugin {
  name = 'Sally';
  icon = sallyPng;
  // model = null;
  action = "sally";
  placeholder = i18n.t('doc.agent.sally.placeholder', 'Input your message...');;
  description = "Your AI Assistant, powered by GPT or Gemini.";
  // introduce = i18n.t('doc.wellcome_message', `Hi! I'm Sally,How can I assist you today?`);
  // introduce = i18n.t('prompt:doc_introduction', "Hi! I'm Sally,How can I assist you today?");
  introduce = () => {
    return <CardIntroduce />;
  };
  instruction = instruction;
  fileConfig = {
    accept: {
      text: false,
      image: true
    },
    maxSize: 2 * 1014 * 1024,
    maxFiles: 1,
    multiple: false,
  };
  quickReplies = () => {
    const { plugin, plugins, platform } = this.context;
    const agents = plugin.agents.map(id => {
      return {
        id,
        name: id,
        enable: true
      };
    }).map((agent) => {
      return {
        code: agent.id,
        name: capitalizeFirstLetter(i18n.t(`doc.agent.${agent.id}` as any)),
        tip: i18n.t(`doc.agent.${agent.id}.short_description`, agent.name)
      };
    });

    const quickReplies: QuickReplyItem[] = [
      // platform === 'google' ? {
      //   code: 'chat-context',
      //   name: i18n.t('doc.menu.chat_context', 'Chat Context'),
      //   tip: i18n.t('doc.tip.chat_context', 'Show chat context')
      // } : null,
      // {
      //   code: 'translate',
      //   name: i18n.t('doc.translate', 'Translate'),
      //   tip: i18n.t('doc.tip.translate', 'Translate selected text'),
      //   icon: 'translate',
      // },
      // {
      //   code: 'summarize',
      //   name: i18n.t('doc.summarize', 'Summarize'),
      //   tip: i18n.t('doc.tip.summarize', 'Summarize selected text'),
      //   icon: '',
      // },
      // {
      //   code: 'optimize',
      //   name: i18n.t('doc.optimize', 'Optimize'),
      //   tip: i18n.t('doc.tip.optimize', 'Optimize selected text'),
      //   icon: '',
      // },
      // {
      //   code: 'contine_write',
      //   name: i18n.t('doc.contine_write', 'Contine writing'),
      //   tip: i18n.t('doc.tip.contine_writ', 'Contine write selected text'),
      //   icon: '',
      // },
      // {
      //   code: 'make_longer',
      //   name: i18n.t('doc.make_longer', 'Make longer'),
      //   tip: i18n.t('doc.tip.make_longer', 'Make selected text longer'),
      //   icon: '',
      // },
      // {
      //   code: 'make_shorter',
      //   name: i18n.t('doc.make_shorter', 'Make shorter'),
      //   tip: i18n.t('doc.tip.make_shorter', 'Make selected text shorter'),
      //   icon: '',
      // },
      // {
      //   code: 'make_titles',
      //   name: i18n.t('doc.make_titles', 'Make titles'),
      //   tip: i18n.t('doc.tip.make_titles', 'Make titles for document'),
      //   icon: '',
      // },
      // {
      //   code: 'formula',
      //   name: i18n.t('doc.agent.formula', 'Formula'),
      //   tip: i18n.t('doc.tip.formula', 'Write latex formula'),
      //   icon: '',
      // }
      // , {
      //   code: 'uml',
      //   name: i18n.t('doc.agent.uml', 'UML Diagram'),
      //   tip: i18n.t('doc.tip.uml', 'Write UML Diagrams'),
      //   icon: '',
      // },
      // ...agents
    ];
    return quickReplies;
  };
  onQuickReply = async (item: QuickReplyItem) => {
    const { plugins, setPlugin, appendMsg, setTyping, setMode, resetList } = this.context;
    const plg = plugins.find(p => p.action == item.code);
    if (plg) {
      // resetList([])
      setMode(plg.action, 'custom');
      setPlugin(plg);
      return;
    }

    if (item.code == 'chat-context') {
      setTyping(true);
      const text = await docApi.getSelectedText();
      let content;
      if (text) {
        content = `${t('doc.selected_text', 'You have selected text:')}\n${text}`;
      } else {
        content = `${t('doc.not_selected_text', "You didn't select any text.")}`;
      }
      const msg = this.buildChatMessage(content, 'text', null, 'assistant');
      appendMsg(msg);
    }
    else if (item.code == 'translate') {
      this.sendMsg(this.buildChatMessage(<CardTranslate
        onTranslate={(text) => {
          this.sendMsg(
            this.buildChatMessage(text, 'text')
          );
        }}
      />, 'card'));
    }
    else {
      this.context.setTyping(true);
      const prompt = (promptSetting as any)[item.code];
      const text = await docApi.getSelectedText();
      const result = await this.context.chat({
        messages: [
          {
            role: 'system',
            content: `${prompt}\n Returns the language type entered by the user if the user did not specify one.`
          },
          {
            role: 'user',
            content: text,
          }]
      });
      this.sendMsg(this.buildChatMessage(result.content, 'text'));
    }
  };
  onSend = (input: IChatMessage) => {
    // 用户发送的消息，拦截，自定义一些操作
    return input;
  };
  tools: any[] = ['search', 'create_images'];
  agents: any[] = ['vision', 'uml', 'formula'];
  injectContext = async () => {
    const text = await docApi.getSelectedText();
    if (text) {
      return `I have selected text:\n\n${text}`;
    }
    return "I didn't selected some text.";
  };
  onReceive = async (message: IChatMessage) => {
    const { setTyping, plugins } = this.context;
    // const text = message.content as string;
    // no plugin ,chat with GPT
    setTyping(true);

    if (!message.content) {
      return;
    }

    if (message.type == 'parts') {
      if (message.files.some(p => p.name.includes('png') || p.name.includes('jpg') || p.name.includes('jpeg'))) {
        const agent = plugins.find(p => p.action === 'vision');
        const msg = await agent.onReceive(message);
        return msg;
      }
    }
    return await super.onReceive(message);
  };
  // render() {
  //   return <SallyRender />
  // }
}

export default new Start();
