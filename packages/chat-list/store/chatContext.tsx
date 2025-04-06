import useMessages from 'chat-list/hook/useMesssages';
import {
  ChatState,
  DocType,
  IChatPlugin,
  IChatStatus,
  IPreview,
  ModeType,
} from 'chat-list/types/plugin';
import { ChatMessageType, ChatMessageWithoutId, IChatMessage } from 'chat-list/types/message';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { findPlugin } from 'chat-list/plugins';
import {
  IChatBody,
} from 'chat-list/types/chat';
import { UserContext } from 'chat-list/store/userContext';
import { chat, completions } from 'chat-list/service/message';
import { buildChatMessage } from 'chat-list/utils/chat';
import { extractMentions, platform, removeMentions, sleep, uuid } from 'chat-list/utils';
import CardPriacy from 'chat-list/components/card-privacy';
import { getUserPrivacyState } from 'chat-list/service/users';
import useLocalStore from 'chat-list/hook/useLocalStore';
import { publish, subscribe, unsubscribe } from 'chat-list/msb/public';
import { parseDocuments } from 'chat-list/utils/file';
import { logEvent, pageView } from 'chat-list/service/log';
import useModel from 'chat-list/hook/useModel';
import toolMap from 'chat-list/tools';
import useAgentTools from 'chat-list/hook/useAgentTools';
import CardMute from 'chat-list/components/card-mute';
import userApi from '@api/user';
import CustomAgent from 'chat-list/plugins/custom';
import { IAgent } from 'chat-list/types/agent';
import ToolMessage from 'chat-list/components/tool-message';
import { DEFAULT_MODEL } from 'chat-list/config/llm';
import usePrompts from 'chat-list/hook/usePrompts';
import imageStore from 'chat-list/utils/image';
import { initDB, saveSession } from 'chat-list/service/history';

const PLATFORM = platform();
const memStore = {
  privateState: false
};
const ChatContext = createContext<Partial<ChatState>>({
  platform: PLATFORM,
  text: '',
  placeholder: '',
  loading: false,
  typing: false,
  status: 'done',
  plugins: [],
  messages: [],
  plugin: null,
  replies: [],
  mode: {},
  mute: false,
  model: DEFAULT_MODEL,
  dataAsContext: true,
  dataContext: '',
  tools: [],
  preview: null,
});

const ChatProvider = ({
  docType,
  plugins: insidePlugins,
  children,
}: {
  docType: DocType;
  plugins: IChatPlugin[];
  children: React.ReactNode;
}) => {
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const { user, setUserState, updatePoints, setOpenLogin } = useContext(UserContext);
  const [plugins, setPlugins] = useState(insidePlugins);
  const tools = toolMap[docType];

  const [plugin, setPlugin] = useState<IChatPlugin>(plugins[0]);

  const {
    typing,
    messages,
    appendMsg,
    setTyping,
    prependMsgs,
    updateMsg,
    resetList,
    deleteMsg
  } = useMessages([]);
  const context = useRef<ChatState>(null);
  const { value: mode, setValue: setMode } = useLocalStore<{ [x: string]: ModeType }>('sally-chat-mode', {});
  const [mute, setMute] = useState(false);
  const { model, setModel, provider, setProvider, setApiKey, setBaseUrl, getApiKey, getBaseUrl } = useModel();
  const { prompts, loadPrompts } = usePrompts(docType);
  const { value: dataAsContext, setValue: setDataAsContext } = useLocalStore<boolean>('sheet-chat-data-context', true);
  const [dataContext, setDataContext] = useState('');
  const { agentTools, colAgents, setAgentTools, setAgentTool, setColAgent, setColAgents } = useAgentTools(plugin, plugins, docType, tools);
  const [replies, setReplies] = useState([]);
  const [fileList, setFileList] = useState<File[]>([]);
  const [status, setStatus] = useState<IChatStatus>('done');
  const [placeholder, setPlaceholder] = useState('');
  const [preview, setPreview] = useState<IPreview>(null);

  const handleAt = useCallback(
    (text: string, messages: any) => {
      const input = text.trimEnd().replace(/^[@/]/g, '');
      // const command = extractCommand(text);
      const result = findPlugin(plugins, input);
      if (result.exact) {
        if (plugin && plugin.action === result.plugin.action) {
          return true;
        }
        if (plugin) {
          (plugin as any)['messages'] = messages;
        }
        const msgs = (result.plugin as any)['messages'];
        if (msgs) {
          resetList(msgs);
        } else {
          resetList([]);
        }
        // if exact match set default prompt
        pageView(result.plugin.action);
        setPlugin(result.plugin as IChatPlugin);

        return true;
      }
      return false;
    }, [plugin, plugins]);

  const checkPrivacyState = useCallback(async () => {
    const privacyState = await getUserPrivacyState();
    if (!privacyState) {
      const msg = buildChatMessage(
        <CardPriacy
          onConfirm={() => {
            // setTyping(true);
            // setTimeout(() => {
            //   appendMsg(
            //     buildChatMessage(
            //       `Welcome Aboard! 🚀 Thank you for confirming our Privacy Policy. We're excited to serve you. If you have any questions or need assistance, feel free to reach out. Let's get started!`,
            //       'text',
            //       'system'
            //     )
            //   );
            //   setTyping(false)
            // }, 1000);
            newChat();
          }}
        />,
        'card',
        'system'
      );
      appendMsg(msg);
    }
    return privacyState;
  }, []);

  const checkAuth = useCallback(async () => {
    if (!user.isAuthenticated) {
      setOpenLogin(true);
      return false;
    }
    return true;

  }, [user?.isAuthenticated]);

  const checkState = async () => {
    setLoading(true);
    await checkPrivacyState();
    setLoading(false);
  };

  const newChat = () => {
    resetList([]);
    imageStore.clear();
    try {
      plugins.forEach((plg) => {
        plg.memory = [];
        plg.conversationId = uuid();
        plugin.stop();
      });
      plugin.stop();
    } catch (e) {
      console.log(e);
    }
  };
  const quickReply = useCallback((item: any) => {
    if (item.action === 'abort') {
      // if (typing) {
      setMute(!mute);
      setTyping(false);
      appendMsg({
        role: 'user',
        content: mute ? 'Okay, you guys keep talking.' : 'Okay, you guys, stop talking!',
        type: 'text',
        position: 'right'
      });
      // }

      // abort();
      return;
    }
    if (plugin) {
      plugin.onQuickReply(item);
    }
  }, [plugin, typing, setTyping, mute]);


  const showProgress = () => {
    // const msg = buildChatMessage(0, 'progress', 'user')
    const msg: ChatMessageWithoutId = {
      _id: uuid(),
      type: 'progress',
      content: 0,
      position: 'right',
      role: 'user',
    };
    appendMsg(msg);
    const id = msg._id;
    return (value: number) => {
      // console.log(value)
      if (value === 100) {
        deleteMsg(id);
        return;
      }
      // console.log(id)
      const msg: ChatMessageWithoutId = {
        type: 'progress',
        content: value,
        position: 'right',
        role: 'user',
      };
      updateMsg(id, msg);
    };
  };

  const sendMsg = useCallback(async (message: IChatMessage) => {
    if (!message.role || message.role === 'user') {
      // role is null or role is user
      const privacyState = await checkPrivacyState();
      if (!privacyState) {
        return;
      }
      const isAuth = await checkAuth();
      if (!isAuth) {
        return;
      }
      const { type, content } = message;
      const text = content as string;
      if (type === 'text' && text) {
        if (text === '/') {
          const home = plugins.find((p) => p.action === plugins[0].action);
          setPlugin(home);
          resetList([]);
          // showIntro(home);
          return;
        }

        if (text.startsWith('@') || text.startsWith('/')) {
          const pass = handleAt(text, messages);
          if (pass) {
            return;
          }
        }
        // check select range or text append to message
        // let appendContent = '';
        // if (docType === 'sheet') {
        //   const range = await sheetApi.getActiveRange();
        //   if (range.colNum > 1 || range.colNum > 1) {
        //     appendContent = arrayToMarkdownTable(range.values, false);
        //   }
        // } else if (docType == 'doc') {
        //   appendContent = await docApi.getSelectedText();
        // }
        // if (appendContent) {
        //   message.content = message.content + '\n' + appendContent;
        //   message.text = message.text + '\n' + appendContent;
        // }
        if (dataContext) {
          message.context = dataContext;
          setDataContext('');
        }
        appendMsg(message);

      } else if (type === 'file') {
        const files = message.files;
        const progress = showProgress();
        const fileContent = await parseDocuments(message.files, async (file, i) => {
          await sleep(300);
          progress(((i + 1) / files.length) * 100);
        });
        if (fileContent) {
          message.content = fileContent;
          message.text = fileContent;
        } else {
          message.text = '';
        }
        appendMsg(message);
      } else if (type === 'parts') {
        const files = message.files;
        const text = message.text;
        const progress = showProgress();
        const fileContent = await parseDocuments(message.files, async (file, i) => {
          await sleep(300);
          progress(((i + 1) / files.length) * 100);
        });
        // const fileNames = message.files.map(p => `1. ${p.name}`).join('\n');
        if (fileContent) {
          message.content = 'Reply to me using the attached files below directly:\n\n<files>\n\n' + fileContent + '\n\n</files>\n\n' + text;
          // message.type = 'text';
          // message.content = `Here are files:\n${fileNames}\n\n${text}\nlet knowledge handle it.`
        } else {
          message.content = text;
        }
        appendMsg(message);
      } else {
        appendMsg(message);
      }
    }
    setTimeout(() => {
      publish(message);
    }, 0);

  }, [model, plugins, dataContext, user]);


  const subscribeMessage = useCallback(() => {
    if (!context.current) {
      return;
    }
    // subscribe all message from assistant
    subscribe((message) => {

      appendMsg(message);
    }, {
      sender: user.email,
      mentions: [],
      role: 'assistant'
    });
    // current plugin subscribe message from user,no mention
    subscribe(async (message) => {
      try {
        setTyping(true);
        // const { appendMsg } = this.context;
        if (mute) {
          appendMsg(buildChatMessage(<CardMute message={message} onContinue={() => {
            setMute(false);
            sendMsg(message);
          }} />, 'card'));
          return;
        }
        if (typeof message.content === 'string' && message.content.startsWith('@')) {
          message.mentions = extractMentions(message.content);
          message.content = removeMentions(message.content);
          message.text = message.content;
        }
        await plugin.onReceive(message);

        // check points, if points < 0, show message to user
      } catch (e) {
        console.error(e);
        logEvent('exception', {
          'agent': plugin.action,
          'message': e.message,
        });
        if (e.code === 401) {
          setUserState({
            isAuthenticated: false
          });
        } else if (e.message) {
          appendMsg(buildChatMessage(`${e.message}`, 'text'));
        }

      } finally {
        setTyping(false);
      }

    }, {
      sender: plugin.action,
      mentions: [],
      role: 'user'
    });
    // plugin only subscribe message that include mention
    // plugins
    //   .filter(p => p.action !== 'sally')
    //   .forEach((plg) => {
    //     subscribe(async (message) => {
    //       plg.context = context.current;
    //       try {
    //         setTyping(true);
    //         await plg.chatWithAgent(message)
    //       } catch (e) {
    //         console.error(e)
    //         logEvent('exception', {
    //           'agent': plg.action,
    //           'message': e.message,
    //         })
    //         if (e.code === 401) {
    //           setUserState({
    //             isAuthenticated: false
    //           })
    //         } else {
    //           appendMsg(buildChatMessage(`Exception: ${e.message}`, 'text'));
    //         }
    //       } finally {
    //         setTyping(false);
    //       }
    //     }, {
    //       sender: plg.action,
    //       mentions: [plg.action]
    //     })
    //   })
  }, [plugin, model]);

  const chatByModel = useCallback(async (args: IChatBody, callback: any) => {

    args.model = args.model || model;
    args.agent = plugin.action;
    // args.temperature = typeof args.temperature === 'undefined' ? 0.7 : args.temperature;
    // args.top_p = typeof args.top_p === 'undefined' ? 0.9 : args.top_p;
    // args.max_tokens = typeof args.max_tokens === 'undefined' ? 1024 : args.max_tokens;
    const result = await chat(args, callback);
    return result;
  }, [model, plugin]);

  const loadAgents = async () => {

    try {
      const list = await userApi.getAgents({
        email: user.email,
        type: docType,
      });
      if (list && list.length > 0) {
        const customAgents = list.map((agent: IAgent) => {
          return new CustomAgent(agent);
        });
        const allPlugins = insidePlugins.concat(customAgents);
        setPlugins(allPlugins);

      }

    } catch (e) {
      console.log(e);
    }
  };

  const showMessage = (message: string | React.ReactNode, role: 'tool' | 'assistant' = 'tool', type: ChatMessageType = 'text') => {
    if (role === 'tool') {
      const msg = buildChatMessage(<ToolMessage status='running' content={`${message}`} />, 'card', 'assistant');
      appendMsg(msg);
      return {
        delete() {
          deleteMsg(msg._id);
        },
        update(message: string) {
          const result = buildChatMessage(<ToolMessage status='running' content={`${message}`} />, 'card', 'assistant',);
          result._id = msg._id;
          updateMsg(msg._id, result);
        },
        succeeded(message: string) {
          const result = buildChatMessage(<ToolMessage status='success' content={`${message}`} />, 'card', 'assistant',);
          result._id = msg._id;
          updateMsg(msg._id, result);
        },
        failed(error: string) {
          const result = buildChatMessage(<ToolMessage status='failed' content={`${error}`} />, 'card', 'assistant',);
          result._id = msg._id;
          updateMsg(msg._id, result);
        }
      };
    } else if (role === 'assistant') {
      const msg = buildChatMessage(message, type, 'assistant');
      let isAppend = false;
      if (!message) {
        isAppend = false;
        setTyping(true);
      } else {
        isAppend = true;
        appendMsg(msg);
      }
      return {
        delete() {
          deleteMsg(msg._id);
        },
        update(message: string | React.ReactNode) {
          // msg.content = message;
          if (isAppend) {
            const result = buildChatMessage(message, type, 'assistant',);
            result._id = msg._id;
            updateMsg(msg._id, result);
          } else {
            isAppend = true;
            const result = buildChatMessage(message, type, 'assistant',);
            result._id = msg._id;
            appendMsg(msg);
          }
        }
      };
    }

  };

  const setAgentMode = (agent: string, modeType: ModeType) => {
    setMode({
      ...mode,
      [agent]: modeType
    });
  };

  const saveChatHistory = async () => {
    try {
      await initDB(docType)
      if (messages.length > 0) {
        // store session to index db
        const session = {
          id: plugin.conversationId,
          model,
          input: messages[0].content,
          messages: messages.filter(msg => msg.type !== 'card'),
          memory: plugin.memory,
          images: imageStore.values(),
          agent: plugin.action,
          createdAt: new Date().toISOString(),
        }
        saveSession(session);
      }
    } catch (e) {
      console.log(e);
    }
  }

  context.current = {
    platform: PLATFORM,
    plugins,
    plugin,
    messages,
    replies,
    loading,
    typing,
    placeholder,
    setPlaceholder,
    setPlugin,
    setPlugins,
    appendMsg,
    resetList,
    setTyping,
    prependMsgs,
    updateMsg,
    deleteMsg,
    sendMsg,
    quickReply,
    text,
    setText,
    chat: chatByModel,
    completions,
    user,
    docType,
    mode,
    setMode: setAgentMode,
    mute,
    setMute,
    model,
    setModel,
    provider,
    setProvider,
    setApiKey,
    setBaseUrl,
    getApiKey,
    getBaseUrl,
    dataAsContext,
    setDataAsContext,
    dataContext,
    setDataContext,
    tools,
    agentTools,
    colAgents,
    setAgentTools,
    setAgentTool,
    setColAgent,
    setColAgents,
    newChat,
    status,
    setStatus,
    showMessage,
    fileList,
    setFileList,
    preview,
    setPreview,
    loadAgents,
    prompts,
    loadPrompts
  };

  useEffect(() => {
    plugin.context = context.current;
    if (!plugin) {
      setReplies([]);
      return;
    }
    const list = plugin.quickReplies('');
    if (list) {
      setReplies(list);
    }
    const placeholder = plugin.placeholder || plugin.description;
    if (placeholder) {
      setPlaceholder(placeholder);
    }

    // if (plugin.tools && plugin.tools.length > 0) {
    //   plugin.tools = plugin.tools.filter(name => tools.some(tool => tool.name == name));
    //   const list = plugin.tools.map((id) => {
    //     return {
    //       id,
    //       name: id,
    //       enable: true
    //     };
    //   });

    //   setAgentTools(list);
    // } else {
    //   setAgentTools([]);
    // }

  }, [plugin]);

  useEffect(() => {
    plugin.context = context.current;
    if (plugin.onLoad) {
      plugin.onLoad();
    }
  }, [plugin]);

  useEffect(() => {
    if (plugins) {
      plugins.forEach((plg) => {
        plg.context = context.current;
      });
    }
  }, [context.current]);

  useEffect(() => {
    subscribeMessage();
    return () => {
      unsubscribe();
    };
  }, [subscribeMessage]);


  useEffect(() => {
    if (!user.isAuthenticated) {
      return;
    }
    loadAgents();
  }, [user.isAuthenticated]);

  useEffect(() => {
    if (memStore.privateState) {
      return;
    }
    memStore.privateState = true;
    checkState();
  }, [plugin]);

  useEffect(() => {

    saveChatHistory();

  }, [messages, plugin, model]);

  // console.log('agent_tools', agentTools)

  return (
    <ChatContext.Provider value={context.current}>
      {children}
    </ChatContext.Provider>
  );
};

export { ChatContext, ChatProvider };
