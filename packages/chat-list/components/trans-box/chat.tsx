/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useEffect, useRef, useState } from 'react';

import { buildChatMessage, debounce, uuid } from 'chat-list/utils'

import styles from './index.module.css';
import { Loader2 } from 'lucide-react';
import useLocalStore from 'chat-list/hook/useChromeStore';
import cn from 'classnames';
import useMessages from 'chat-list/hook/useMesssages';
import { chat } from 'chat-list/service/message';
import { ChatMessageWithoutId } from 'chat-list/types/message';
import CopyButton from 'chat-list/components/copy-button';
import Checkbox from './checkbox'
import Markdown from './markdown';
// import test from './test.md'

interface IChatListProps {
  selectedText?: string;
  className?: string;
  onClose: () => void;
}

type IStatus = 'inputing' | 'waitting' | 'done';

const App = (props: IChatListProps) => {
  const { onClose, selectedText } = props;
  const [status, setStatus] = useState<IStatus>('inputing');
  const statusRef = useRef<IStatus>('inputing');
  // const [lang, setLang] = useState(pageLanguage)
  const [inputText, setInputText] = useState(selectedText)

  const { value: chatWithPage, setValue: setChatWithPage } = useLocalStore<boolean>('chat-with-page', false);
  const { messages, appendMsg, updateMsg, resetList } = useMessages([]);

  const inputRef = useRef(null);
  const messagesRef = useRef(null);

  function setRefStatus(sta: IStatus) {
    statusRef.current = sta;
    setStatus(sta)
  }


  function reset() {
    setInputText('');
    resetList([])
    setStatus('inputing')
    statusRef.current = 'inputing';
    inputRef.current.focus();
  }

  function getPageContent() {
    // 获取页面的文本内容,获取main获取artcile
    const article = document.querySelector('article');
    const main = document.querySelector('main');
    const pageContent = document.documentElement.innerText;
    if (article) {
      return article.innerText;
    }
    if (main) {
      return main.innerText;
    }
    return pageContent;
  }

  function init() {

    async function onKeydown(event: any) {
      // console.log('onKeydown')

      if (event.key === 'Tab') {
        event.preventDefault();
        onSent();
      }

    }
    // 判断父元素是否有id为sally-input的元素
    const isSallyContainer = (element: any): boolean => {
      if (!element) return false;
      if (element.id === 'sally-container') return true;
      return isSallyContainer(element.parentElement);
    }
    const onSelection = debounce(() => {
      const activeElement = document.activeElement;
      if (activeElement && (activeElement.id == ('sally-input'))) {
        return;
      }

      const selections = window.getSelection();
      const isContainer = isSallyContainer(selections.anchorNode);
      if (isContainer) {
        return;
      }
      const selectedText = selections.toString().trim();
      if (selectedText) {
        setStatus('inputing');
        statusRef.current = 'inputing';
        setInputText(selectedText);
      }
    }, 500);

    document.body.addEventListener('keydown', onKeydown);
    // document.addEventListener('selectionchange', onSelection)


    return () => {
      document.body.removeEventListener('keydown', onKeydown);
      // document.removeEventListener('selectionchange', onSelection)
    }
  }

  const onSent = async () => {
    const inputText = inputRef.current.value;
    if (!inputText) {
      return;
    }
    setRefStatus('waitting');
    appendMsg(buildChatMessage(inputText, 'text', 'user'));
    setInputText('')
    const msgs = messages.map((item) => {
      return {
        role: item.role,
        content: item.content
      }
    });

    let newMsgs: any = msgs.concat([{ role: 'user', content: inputText }]);
    if (chatWithPage) {
      const content = getPageContent();
      const systemMsg = { role: 'system', content: `You need answer quesitons based on current web page content.\nWEB PAGE CONTENT:\n"""${content}\n"""` };
      newMsgs = [systemMsg].concat(newMsgs);
    }

    let isAppend = false;
    const msg: ChatMessageWithoutId = { _id: uuid(), role: 'assistant', content: '' };

    chat({
      messages: newMsgs,
      temperature: 0.7,
      stream: true,
    }, (done, result) => {
      const content = result.content;
      if (!content) {
        return;
      }
      if (!isAppend) {
        isAppend = true;
        msg.content = content;
        appendMsg(msg);
        (messagesRef.current as HTMLDivElement).scrollTop = (messagesRef.current as HTMLDivElement).scrollHeight;

      } else {
        msg.content = content;
        updateMsg(msg._id, msg);
        (messagesRef.current as HTMLDivElement).scrollTop = (messagesRef.current as HTMLDivElement).scrollHeight;
      }
      if (done) {
        setRefStatus('done');
        (messagesRef.current as HTMLDivElement).scrollTop = (messagesRef.current as HTMLDivElement).scrollHeight;
      }
    })
  }
  const onClear = () => {
    reset();
  }

  const onOpen = () => {
    inputRef.current.focus();
    const textBox = inputRef.current;
    textBox.selectionStart = textBox.selectionEnd = selectedText.length;
  }

  useEffect(() => {
    const unregist = init();
    return () => {
      unregist();
    }
  }, [messages, chatWithPage])

  useEffect(() => {
    onOpen();
  }, [])

  useEffect(() => {
    setInputText(selectedText)
  }, [selectedText])

  return (
    <div>
      <div className={styles.topBar}>
        <Checkbox
          checked={chatWithPage}
          className={styles.checkboxInput}
          onChange={(checked) => {
            setChatWithPage(checked);
          }}
        />
        <label htmlFor='chat-with-page' className={styles.label}
          onClick={() => {
            setChatWithPage(!chatWithPage);
          }}
        >
          Chat with page
        </label>
      </div>
      <div className={styles.inputBar}>
        <textarea
          ref={inputRef}
          rows={4}
          id="sally-input"
          value={inputText}
          onChange={e => {
            e.stopPropagation();
            setInputText(e.target.value)
          }}
          placeholder='Message Sally'
          className={styles.inputField}
          onSelect={(e) => e.stopPropagation()}
          onInput={e => e.stopPropagation()}
        />
      </div>
      <div className={styles.toolBar} >
        <button disabled={status === 'waitting'} className={cn(styles.button, styles.primaryButton, status === 'waitting' ? styles.disabledButton : '')} onClick={onSent}>
          {
            status == 'waitting' && (
              <Loader2 height={16} width={16} style={{ flexShrink: 0 }} className={styles.rotate} />
            )
          }
          Tab
        </button>
        <button className={styles.button} onClick={onClear}>
          New chat
        </button>

        <div style={{ flex: 1 }}></div>
        <button className={styles.button} onClick={() => {
          onClose?.();
        }}>
          Ctrl + O
        </button>
        <button className={styles.button} onClick={() => {
          onClose?.();
        }}>
          Close
        </button>
      </div>
      <div ref={messagesRef} className={styles.messages}>
        {
          messages.map((item) => {
            return (
              <div key={item._id} className={cn(styles.messageItem, item.role == 'user' ? styles.userMessage : '')}>
                <div className={styles.messageContent}>
                  <Markdown>
                    {item.content}
                  </Markdown>
                </div>
              </div>
            )
          })
        }
        {
          messages.length > 0 && (
            <div style={{ height: 20, }}></div>
          )
        }
      </div>
    </div>
  );
};

export default App;
