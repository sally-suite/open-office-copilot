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

import Loading from '../loading-logo';
import CheckContext from 'chat-list/components/check-context';
import SelectText from 'chat-list/components/selected-text';
import Avatar from 'chat-list/components/avatars';
import ToolList from 'chat-list/components/tool-list';
import AgentPanel from '../agent-panel';
import NewChat from 'chat-list/components/new-chat';
import LanguageSelect from '../language-select';
import Message from 'chat-list/components/message';
import TextSelectionToolbar from 'chat-list/components/text-selection-toolbar';
import EricPromote from '../eric-promo';
import Button from '../button';
import { PauseCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface IChatListProps {
  className?: string;
}

const App = (props: IChatListProps) => {
  const { className } = props;
  const { t } = useTranslation('base');

  // const [loading, setLoading] = useState(true);
  // const { user } = useContext(UserContext);
  // const navigate = useNavigate();
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
    setMode
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

    if (msg?.from?.icon) {
      return (
        <div className=' w-full'>
          <div className='flex flex-row items-center '>
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


  const onClearMessage = () => {
    newChat();
  };

  function onAbort() {
    if (plugin) {
      plugin.stop();
    }
  }

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
        <div className='message-list flex-1 flex flex-col overflow-auto p-2 ease-in transition-all duration-500'>
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

  useEffect(() => {
    if (!loading) {
      const loading = document.getElementById('loading');
      if (loading) {
        loading.remove();
      }
    }
  }, [loading]);


  if (loading) {
    return (
      <Loading />
    );
  }

  return (
    <div className={cn('flex flex-col h-screen relative bg-white', className)}>
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
      {
        (typing || status == 'processing') && (
          <div className='flex flex-row-reverse items-center justify-center mt-4 mb-10'>
            <Button onClick={onAbort} className='w-auto rounded-full pl-0 pr-2' variant='outline'>
              <PauseCircle className='text-primary h-5 cursor-pointer pulse mr-1' />
              {t('common.stop_output')}
            </Button>
          </div>
        )
      }
      {
        docType === 'sheet' && (
          <div className='w-full flex flex-col'>
            <div className='flex flex-col items-start relative mb-1 '>
              <div className='flex flex-col items-start absolute left-0 bottom-0'>
                <CheckContext />
              </div>
            </div>
            <div className='flex flex-row pb-1 justify-between'>
              <div className='flex flex-row items-center'>
                <AgentPanel />
                <ToolList />
              </div>
              <div className='mr-1' >
                <NewChat />
              </div>
            </div>
          </div>

        )
      }
      {
        (docType === 'doc' || docType == 'slide') && (
          <div className='w-full flex flex-col'>
            <div className='flex flex-col items-start relative mb-1 '>
              <div className='flex flex-row absolute left-0 bottom-0'>
                <AgentPanel />
                <ToolList />
              </div>
              <div className='flex flex-row mr-1 absolute right-0 bottom-0'>
                <NewChat />
              </div>
            </div>
            <SelectText />
          </div>
        )
      }
      <div>
        <Composer
          canRecord={platform == 'google'}
          text={text}
          placeholder={'Chat with me Or type @ to let agent help you.'}
          onSend={onSendMsg}
          onChange={setText}
          inputOptions={{
            rows: 2,
            disabled: typing,
            autoSize: true,
          }} />
      </div>
      <ChatFooter />
      <LanguageSelect />
      <EricPromote />
      {
        (docType == 'doc' || docType == 'side' || docType == 'email' || docType == 'slide') && (
          <TextSelectionToolbar />
        )
      }
    </div>

  );
};

export default App;
