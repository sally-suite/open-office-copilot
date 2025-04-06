/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useEffect, useRef, useState } from 'react';

import { buildChatMessage, uuid } from 'chat-list/utils'

import styles from '../../index.module.css';
import useLocalStore from 'chat-list/hook/useChromeStore';
import cn from 'classnames';
import useMessages from 'chat-list/hook/useMesssages';
import { chat } from 'chat-list/service/message';
import { ChatMessageWithoutId } from 'chat-list/types/message';
import Checkbox from '../../checkbox'
import Markdown from '../../markdown';
import api from '@api/index'
import { SearchResult } from 'chat-list/types/search';
import { IChatBoxProps } from '../../types';
import { Textarea } from 'chat-list/components/ui/textarea';
import { SendButton } from 'chat-list/components/composer/Composer/SendButton';
import { StopCircle } from 'lucide-react';
import Button from '../../button';
import { useTranslation } from 'react-i18next';

// import test from './test.md'


type IStatus = 'inputing' | 'waitting' | 'done';

const App = (props: IChatBoxProps) => {
  const { onClose, selectedText } = props;
  const [status, setStatus] = useState<IStatus>('inputing');
  const statusRef = useRef<IStatus>('inputing');
  // const [lang, setLang] = useState(pageLanguage)
  const [inputText, setInputText] = useState(selectedText)

  const { value: source, setValue: setSource } = useLocalStore<'search' | 'wiki' | ''>('sally-explain-search', '');
  const { messages, appendMsg, updateMsg, resetList } = useMessages([]);
  const stopRef = useRef(null);
  const { t } = useTranslation('side')

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

  async function getPageContent(keywords: string) {
    const results = await api.search({
      keyword: keywords
    }) as SearchResult[];
    const targets = results.filter(p => p.content || p.snippet);
    if (targets.length == 0) {
      return 'Search result is empty'
    }
    const reply = targets.map((item) => {
      return `URL:${item.url}\n\nTITLE:${item.title}\n\nCONTENT:\n${item.content || item.snippet}`
    }).join('\n\n');

    return `# SEARCH RESULT:\n\n${reply}`
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
    if (source === 'search') {
      const searchResult = await getPageContent(inputText);
      // \n\nSummarize above pages content, help user add footnotes to the citations.
      const content = `${searchResult}\n\nAnswer the user with reference to the search results,and add footnotes to the citations`
      const systemMsg = { role: 'system', content: content };
      newMsgs = [systemMsg].concat(newMsgs);
    } else if (source === 'wiki') {
      const searchResult = await getPageContent(`site:wikipedia.org ${inputText}`);
      // \n\nSummarize above pages content, help user add footnotes to the citations.
      const content = `${searchResult}\n\nAnswer the user with reference to the search results,and add footnotes to the citations`
      const systemMsg = { role: 'system', content: content };
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

  const onOpen = () => {
    inputRef.current.focus();
    const textBox = inputRef.current;
    textBox.selectionStart = textBox.selectionEnd = selectedText.length;
  }
  const setSearchSource = (from: any) => {
    if (source === from) {
      setSource('');
    } else {
      setSource(from);
    }
  }

  const stopGen = () => {
    if (stopRef.current) {
      stopRef.current();
    }
    setRefStatus('done');
  }

  useEffect(() => {
    onOpen();
  }, [])

  useEffect(() => {
    if (selectedText) {
      onSent();
    }
  }, [])

  useEffect(() => {
    setInputText(selectedText)
  }, [selectedText])

  return (
    <div className='text-base flex flex-col w-full'>
      <div className={styles.topBar}>
        <Checkbox
          checked={source == 'search'}
          className={styles.checkboxInput}
          onChange={() => {
            setSearchSource('search');
          }}
        />
        <label htmlFor='search' className={styles.label}
          onClick={() => {
            setSearchSource('search');
          }}
        >
          Search
        </label>
        {/* <Checkbox
          checked={source == 'wiki'}
          className={styles.checkboxInput}
          onChange={() => {
            setSearchSource('wiki');
          }}
        />
        <label htmlFor='wiki' className={styles.label}
          onClick={() => {
            setSearchSource('wiki');
          }}
        >
          Wiki
        </label> */}
      </div>
      <div className=" relative flex flex-row items-center justify-center space-x-1">
        <Textarea
          rows={2}
          ref={inputRef}
          className='h-8 outline-none focus:outline-none pr-6 rounded-sm'
          value={inputText}
          onChange={e => {
            e.stopPropagation();
            setInputText(e.target.value);
            if (status !== 'inputing') {
              setStatus('inputing')
              statusRef.current = 'inputing';
            }
          }}
          placeholder='Ask Sally to...'
          onSelect={(e) => e.stopPropagation()}
          onInput={e => e.stopPropagation()}
          onKeyDown={(e) => {
            if ((!e.ctrlKey && !e.metaKey) && e.key === 'Enter') {
              e.preventDefault();
              e.stopPropagation();
              onSent();
            }
          }}
        ></Textarea>
        <SendButton
          onClick={onSent}
          disabled={!(inputText)}
          className=' absolute right-1 bottom-1'
        />
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
      {
        status == 'waitting' && (
          <div className='flex flex-row justify-center'>
            <StopCircle className='text-primary h-8 cursor-pointer pulse' onClick={stopGen} />
          </div>
        )
      }
      {
        status == 'done' && (
          <div className='flex flex-row items-center justify-center space-x-1'>
            <Button onClick={onClear}>
              {t('new_chat')}
            </Button>
          </div>
        )
      }
    </div>
  );
};

export default App;
