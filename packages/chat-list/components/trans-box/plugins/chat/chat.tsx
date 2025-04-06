/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useEffect, useRef, useState } from 'react';

import { buildChatMessage, uuid } from 'chat-list/utils'

import styles from '../../index.module.css';
import { CornerDownRight, Loader2, StopCircle, X } from 'lucide-react';
import useLocalStore from 'chat-list/hook/useChromeStore';
import cn from 'classnames';
import useMessages from 'chat-list/hook/useMesssages';
import { chat } from 'chat-list/service/message';
import { ChatMessageWithoutId } from 'chat-list/types/message';
import Checkbox from '../../checkbox'
import Markdown from '../../markdown';
import Button from '../../button';
import { Input } from 'chat-list/components/ui/input';
import { SendButton } from 'chat-list/components/composer/Composer/SendButton';
import { IChatBoxProps } from '../../types';
import { useTranslation } from 'react-i18next';
import Container from '../../container';
import { IPluginComponentProps } from '../types';
// import test from './test.md'

type IStatus = 'inputing' | 'waitting' | 'done';

const App = (props: IPluginComponentProps) => {
  const { onClose, selectedText: text, pin, onPin, position, onPositionChange } = props;
  const [status, setStatus] = useState<IStatus>('inputing');
  const statusRef = useRef<IStatus>('inputing');
  // const [lang, setLang] = useState(pageLanguage)
  const [inputText, setInputText] = useState('')
  const [selectedText, setSelectedText] = useState(text);
  const { value: chatWithPage, setValue: setChatWithPage } = useLocalStore<boolean>('chat-with-page', false);
  const { messages, setTyping, appendMsg, updateMsg, resetList } = useMessages([]);
  const { t } = useTranslation('side')
  const stopRef = useRef(null);

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


  const onSent = async () => {
    const inputText = inputRef.current.value;
    if (!inputText) {
      return;
    }
    setRefStatus('waitting');
    let content = inputText;
    if (selectedText) {
      content = `> ${selectedText}\n\n${inputText}`;
    }
    appendMsg(buildChatMessage(content, 'text', 'user'));
    setTyping(true);
    setInputText('')
    const msgs = messages.map((item) => {
      return {
        role: item.role,
        content: item.content
      }
    });

    let newMsgs: any = msgs.concat([{ role: 'user', content }]);
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
    }, (done, result, stop) => {
      stopRef.current = stop;
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
  const stopGen = () => {
    if (stopRef.current) {
      stopRef.current();
    }
    setRefStatus('done');
  }

  const onRender = () => {
    if (!inputRef.current) {
      return;
    }
    inputRef.current.focus();
    const textBox = inputRef.current;
    textBox.selectionStart = textBox.selectionEnd = selectedText.length;
  }

  useEffect(() => {
    setSelectedText(text)
  }, [text])

  return (
    <Container
      title={`${t('chat')}`}
      width={450}
      pin={pin}
      onPin={onPin}
      position={position}
      onPositionChange={onPositionChange}
      onClose={onClose}
      onRender={onRender}
    >
      <div className='text-base flex flex-col w-full'>
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
            {t('chat')}
          </label>
        </div>
        {
          selectedText.length > 0 && (
            <div className='flex flex-row items-center px-1 w-full text-sm text-gray-500 h-6'>
              <CornerDownRight width={16} height={16} className='inline-block' />
              <span className='flex-1  whitespace-nowrap overflow-hidden overflow-ellipsis'>
                [{selectedText.length}] {selectedText}
              </span>
              <X height={16} width={16} className='inline-block cursor-pointer' onClick={() => {
                setSelectedText('')
              }} />
            </div>
          )
        }
        <div className=" relative flex flex-row items-center justify-center space-x-1">
          <Input
            ref={inputRef}
            className='h-8 outline-none focus:outline-none pr-6 rounded-sm'
            id="sally-input"
            value={inputText}
            onChange={e => {
              e.stopPropagation();
              setInputText(e.target.value);
              if (status !== 'inputing') {
                setStatus('inputing')
                statusRef.current = 'inputing';
              }
            }}
            placeholder='Message Sally'
            onSelect={(e) => e.stopPropagation()}
            onInput={e => e.stopPropagation()}
            onKeyDown={(e) => {
              if (!e.shiftKey && e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                onSent();
              }
            }}
          ></Input>
          <SendButton
            onClick={onSent}
            disabled={!(inputText)}
            className=' absolute right-1 top-1/2 -translate-y-1/2'
          />
        </div>


        {/* <div className={styles.toolBar} >
        <Button disabled={status === 'waitting'} className={cn(styles.primaryButton, status === 'waitting' ? styles.disabledButton : '')} onClick={onSent}>
          Tab
        </Button>
        <Button onClick={onClear}>
          New chat
        </Button>

        <div style={{ flex: 1 }}></div>
        <div className={styles.shortcut} >
          Ctrl + O
        </div>
      </div> */}
        <div ref={messagesRef} className={styles.messages}>
          {
            messages.map((item) => {
              if (item.type === 'typing') {
                return (
                  <div key={item._id} className={cn(styles.messageItem)}>
                    <div className=" inline-flex justify-center bg-gray-100 p-1 px-2 text-sm rounded-[10px] text-gray-800 w-10 max-w-[80%]">
                      <Loader2 height={16} width={16} className={styles.rotate} />
                    </div>
                  </div>
                )
              }
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
        {
          status == 'waitting' && (
            <div className='flex flex-row justify-center'>
              <StopCircle className='text-primary h-8 cursor-pointer pulse' onClick={stopGen} />
            </div>
          )
        }
        {
          status == 'done' && (
            <div className='flex flex-row items-center justify-center space-x-1 mt-1'>
              <Button onClick={onClear}>
                {t('new_chat')}
              </Button>
            </div>
          )
        }
      </div>
    </Container>
  );
};

export default App;
