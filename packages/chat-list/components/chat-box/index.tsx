import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { ChatMessageType } from 'chat-list/types/message';
import { ChatContext } from '../../store/chatContext';

import { buildChatMessage, debounce } from 'chat-list/utils'

import Loading from '../loading-logo';
import Spin from '../loading'
import styles from './index.module.css';
import IconButton from 'chat-list/components/icon';
import { translate } from 'chat-list/service/translate';
import { Languages, TextCursorInput, X } from 'lucide-react';
import LanguageList from 'chat-list/components/language-list'
import useLocalStore from 'chat-list/hook/useLocalStore';

interface IChatListProps {
  className?: string;
}

type IStatus = 'inputing' | 'translating' | 'translated';

const pageLanguage = navigator.language || navigator.userLanguage;


const App = (props: IChatListProps) => {
  const { className } = props;

  // const [loading, setLoading] = useState(true);
  // const { user } = useContext(UserContext);

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
  const [selectedText, setSelectedText] = useState('');
  const transTextEle = useRef<HTMLDivElement>();

  const { value: pageChatEnable, setValue: setPageChatEnable } = useLocalStore('page-chat-enable', true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [initialLeft, setInitialLeft] = useState(0);
  const [initialTop, setInitialTop] = useState(0);

  const [startWidth, setStartWidth] = useState(0);
  const [minWidth] = useState(300);
  const editorRef = useRef(null);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX);
    setStartY(e.pageY);
    setInitialLeft(editorRef.current.offsetLeft);
    setInitialTop(editorRef.current.offsetTop);
    // setStartWidth(editorRef.current.offsetWidth);
  };

  const handleMouseMove = (e) => {
    console.log(e)
    if (!isDragging) return;

    const deltaX = e.pageX - startX;
    const deltaY = e.pageY - startY;

    editorRef.current.style.left = `${initialLeft + deltaX}px`;
    editorRef.current.style.top = `${initialTop + deltaY}px`;

  }

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 当鼠标离开编辑器区域时，也停止拖动
  const handleMouseLeave = () => {
    setIsDragging(false);
  };


  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('mouseleave', handleMouseLeave);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isDragging]);


  const onSendMsg = useCallback(async (type: ChatMessageType, content: string) => {
    await sendMsg(buildChatMessage(content, type as ChatMessageType, 'user', { name: user.username }))
  }, [sendMsg])


  function onClose() {
    setPageChatEnable(false);
  }
  function onDeselect() {
    setSelectedText('')
  }

  const sendMessage = useCallback(debounce(() => {
    const selectedText = window.getSelection().toString().trim();
    if (selectedText) {
      setSelectedText(selectedText);
    }

  }, 500), []);

  function init() {
    document.addEventListener('selectionchange', sendMessage)
    return () => {
      document.removeEventListener('selectionchange', sendMessage)
    }
  }

  useEffect(() => {
    const unregist = init();
    return () => {
      unregist();
    }
  }, [])

  if (!pageChatEnable) {
    return null;
  }

  return (

    <div ref={editorRef} className={styles.chatBox} style={{ display: 'block' }} id="translation-popup">
      <div className="h-2 w-full absolute -left-0 top-0 bottom-0  cursor-move z-20 bg-red-500 " onMouseDown={handleMouseDown}></div>

      <span className={styles.close} onClick={onClose} >
        <X height={16} width={16} />
      </span>
      {/* <div className='flex flex-row items-center'>
        <Languages height={16} width={16} />
        <LanguageList value={lang} className='h-6 text-sm border-0  leading-6 py-0 shadow-none  px-1' onChange={onLanChange} />
      </div> */}
      <div className={styles.textWarper}>
        <span className='mr-1'>
          <TextCursorInput height={16} width={16} className='text-gray-400' />
        </span>
        {
          selectedText && (
            <>
              <span ref={transTextEle} >
                {selectedText}
              </span>
              <span className={styles.cancelSelect} onClick={onDeselect} >
                <X height={16} width={16} />
              </span>
            </>
          )
        }
        {
          !selectedText && (
            <span>No selected text.</span>
          )
        }

      </div>
      <input className=' border w-full rounded-md  py-2 px-3 text-sm leading-5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 ' type="text" />
    </div>
  );
};

export default App;
