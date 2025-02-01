
import React, { useCallback, useContext, useEffect } from 'react';
import { ChatMessageType, IChatMessage } from 'chat-list/types/message';
import Composer from 'chat-list/components/composer';
import ReactMarkdown from 'chat-list/components/markdown';
import CardProgress from 'chat-list/components/card-progress';
import { ChatContext } from '../../store/chatContext';
import Bubble from 'chat-list/components/bubble';

import { buildChatMessage } from 'chat-list/utils';
import FilesCard from 'chat-list/components/card-files';
import MessageList from 'chat-list/components/message-list';
import ChatFooter from 'chat-list/components/chat-footer';
import { cn } from 'chat-list/lib/utils';

import { useNavigate, useParams } from 'react-router-dom';
import Loading from '../loading-logo';
import ErrorBoundary from 'chat-list/components/error-boundary';
import { pageView } from 'chat-list/service/log';
import CheckContext from 'chat-list/components/check-context';
import SelectText from 'chat-list/components/selected-text';
import Header from '../header';
import Avatar from 'chat-list/components/avatars';
import ChatHeader from '../chat-header';
import ToolList from 'chat-list/components/tool-list';
import { useTranslation } from 'react-i18next';
import LanguageSelect from '../language-select';
import Message from '../message';
import EricPromote from '../eric-promo';
import Button from '../button';
import TextSelectionToolbar from 'chat-list/components/text-selection-toolbar';

interface IChatListProps {
  className?: string;
}

const App = (props: IChatListProps) => {
  const { className } = props;
  const { t } = useTranslation('base');

  // const [mode, setMode] = useState<ModeType>('chat-list')
  const navigate = useNavigate();
  const { agent } = useParams();

  const context = useContext(ChatContext);
  const {
    messages,
    loading,
    typing,
    sendMsg,
    text,
    setText,
    user,
    plugin,
    setPlugin,
    plugins,
    setPlugins,
    docType,
    platform,
    newChat,
    mode,
    setMode,
    placeholder
  } = context;

  function renderMessageContent(msg: IChatMessage) {

    const { type, content, card, files, text, role } = msg;

    let contentNode;

    if (type === 'progress') {
      contentNode = <CardProgress percentage={msg.content}></CardProgress>;
    }

    if (type === 'card') {
      contentNode = <Bubble className="bubble" type="card" content={card || content} />;
    }

    if (type === 'text') {
      contentNode = <ReactMarkdown docType={docType} copyContentBtn={role === 'assistant'} className="bubble text">{(content || text) + ''}</ReactMarkdown>;
    }

    if (type === 'file') {
      contentNode = (
        <FilesCard files={files} />
      );
    }

    if (type === 'parts') {
      contentNode = (
        <FilesCard text={text} files={files} title='' />
      );
    }

    if (msg.context) {
      contentNode = (
        <div className='flex flex-col items-start context'>
          {plugin.renderMessageContext(msg.context)}
          {contentNode}
        </div>
      );
    }

    if (msg?.from?.icon) {
      return (
        <div className=' w-full'>
          <div className='flex flex-row'>
            <Avatar icon={msg?.from?.icon} name={msg?.from?.name} />
          </div>
          {contentNode}
        </div>
      );
    }
    return contentNode;
  }
  const onSendMsg = useCallback(async (type: ChatMessageType, content: string) => {
    await sendMsg(buildChatMessage(content, type as ChatMessageType, 'user', { name: user.username }));
  }, [sendMsg]);

  const renderIntroduction = () => {
    let content: string | React.ReactNode = "";
    if (plugin) {
      content =
        typeof plugin.introduce == 'string'
          ? plugin.introduce
          : plugin.introduce();
    }
    if (typeof content === 'string') {
      return (
        <div className='message-list flex-1 flex flex-col overflow-auto p-2 '>
          <Avatar icon={plugin.icon} name={plugin.name} />
          <ReactMarkdown showTableMenu={false} copyContentBtn={false} className="bubble text">{(content || text) + ''}</ReactMarkdown>
        </div>
      );
    }
    return (
      <div className='message-list flex-1 flex flex-col overflow-auto p-2 '>
        <Avatar icon={plugin.icon} name={plugin.name} />
        {content}
      </div>
    );
  };
  const onClearMessage = () => {
    newChat();
  };

  const gotoSetting = () => {
    navigate(`/setting/${plugin.id}`);
  };

  function renderInputContext() {
    if (docType == 'doc' || docType == 'slide' || docType == 'side') {
      return (
        <SelectText />
      );
    } else if (docType == 'sheet') {
      return (
        <CheckContext />
      );
    }
    return null;
  }

  useEffect(() => {
    if (!loading) {
      const loading = document.getElementById('loading');
      if (loading) {
        loading.remove();
      }
    }
  }, [loading]);

  useEffect(() => {
    let tarAgent = agent;
    if (!tarAgent) {
      const queryString = window.location.search; // 获取查询字符串
      const params = new URLSearchParams(queryString);
      tarAgent = params.get('agent'); // 获取查询参数 foo
    }

    if (tarAgent) {
      const plg = plugins.find(p => p.action === tarAgent);
      if (plg) {
        setMode(plg.action, plg.mode || 'chat');
        setPlugin(plg);
      } else {
        navigate('/');
      }
    } else {
      setPlugin(plugins[0]);
    }

  }, [agent]);


  if (loading) {
    return (
      <Loading />
    );
  }

  if (mode[plugin.action] === 'custom' && plugin.render) {
    if (plugin.render) {
      pageView(plugin.action);
      return (
        <div className={cn('flex flex-col h-screen bg-white', className)}>
          <Header
            onBack={() => {
              navigate(`/`);
              setMode(plugin.action, 'chat');
            }} >
            <Avatar icon={plugin.icon} name={plugin.name} />
          </Header>
          <div className='flex-1 overflow-auto'>
            <ErrorBoundary>
              {plugin.render()}
            </ErrorBoundary>
          </div>
        </div>
      );
    }
  }

  return (
    <div className={cn('flex flex-col h-screen relative bg-white', className)}>
      {
        docType !== 'chat' && (
          <ChatHeader />
        )
      }

      {/* {
        messages.length == 0 && (renderIntroduction())
      } */}
      {messages.length == 0 && (
        <div className='flex-1 flex flex-col overflow-auto'>
          <Message key={plugin.action} timestamp='' message={{ _id: "0", type: 'text', content: '' }} renderMessageContent={renderIntroduction} />
        </div>
      )}

      {
        messages.length > 0 && (
          <MessageList
            className='flex-1 flex flex-col overflow-auto'
            onClear={onClearMessage}
            messages={messages}
            renderMessageContent={renderMessageContent}
          />
        )
      }
      {/* {
        docType == 'chat' && (
          <NewChatButton />
        )
      } */}
      <div className=' w-full flex flex-row items-center z-20 relative'>
        <div className='flex flex-row absolute left-1 bottom-0 right-1 justify-between'>
          <ToolList />

          {
            docType == 'chat' && (
              <Button className='w-20 h-6' variant='secondary' onClick={newChat} >
                {t('base:common.new_chat')}
              </Button>
            )
          }
        </div>
      </div>
      <Composer
        context={renderInputContext()}
        canRecord={false}
        text={text}
        placeholder={placeholder || t('agent.sally.placeholder') || 'Chat with me Or type @ to let agent help you.'}
        onSend={onSendMsg}
        onChange={setText}
        inputOptions={{
          rows: 2,
          disabled: typing,
          autoSize: true,
        }} />
      <ChatFooter />
      <LanguageSelect />
      <EricPromote />
      {
        (docType == 'doc' || docType == 'side' || docType == 'email') && (
          <TextSelectionToolbar />
        )
      }
    </div>
  );
};

export default App;
