/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useEffect, useRef, useState } from 'react';

import { debounce } from 'chat-list/utils';
import styles from '../../index.module.css';
import { improveWriting } from 'chat-list/service/translate';
import LanguageList from 'chat-list/components/language-list/selector'
import useLocalStore from 'chat-list/hook/useChromeStore';
import cn from 'classnames';
import { getLanguage } from 'chat-list/data/translate/languages';
import Checkbox from '../../checkbox';
import Button from '../../button';
import { IChatBoxProps } from '../../types';
import ReplaceAction from '../../actions/Replace';
import CopyAction from '../../actions/Copy';
import InsertAction from '../../actions/Insert';
import ReplayAction from '../../actions/Replay';
import { useTranslation } from 'react-i18next';
import { replaceText } from 'chat-list/utils/writing';
import { Textarea } from 'chat-list/components/ui/textarea';
import ToneList from 'chat-list/components/trans-box/trans-style-list/selector';

type IStatus = 'inputing' | 'translating' | 'translated';

const pageLanguage = navigator.language || navigator.userLanguage;
let currentEditableElement: any = null;
let startOffset: number = null;
let endOffset: number = null;
let startContainer: any = null;

const App = (props: IChatBoxProps) => {
  const { onClose, selectedText, selectedRange } = props;
  const [translateText, setTranslateText] = useState('');
  const [status, setStatus] = useState<IStatus>('inputing');
  const statusRef = useRef<IStatus>('inputing');
  const transTextEle = useRef<HTMLDivElement>();
  // const [lang, setLang] = useState(pageLanguage)
  const [inputText, setInputText] = useState(selectedText)
  const { t } = useTranslation(['side'])

  const { value: expand, setValue: setExpand } = useLocalStore<boolean>('trans-box-expand', false);
  const { value: emoji, setValue: setEmoji } = useLocalStore<boolean>('trans-box-emoji', true);
  const { value: grammar, setValue: setGrammar } = useLocalStore<boolean>('trans-box-grammar', true);
  const { value: isTranslate, setValue: setIsTranslate } = useLocalStore<boolean>('trans-box-translate', true);
  const { value: lang, setValue: setLang } = useLocalStore<string>('input-box-lang', pageLanguage);
  const { value: tone, setValue: setTone } = useLocalStore<string>('input-box-tone', 'formal');


  const inputRef = useRef(null);


  function setRefStatus(sta: IStatus) {
    statusRef.current = sta;
    setStatus(sta)
  }

  function reset() {
    setInputText('')
    setTranslateText('');
    setStatus('inputing')
    statusRef.current = 'inputing';
  }
  async function copyContent(content: string) {
    const textBlob = new Blob([content], {
      type: 'text/plain',
    });
    await navigator.clipboard.write([
      new ClipboardItem({
        [textBlob.type]: textBlob,
      }),
    ]);
  }
  function moveCursorToEnd(element: any, end?: number) {
    try {
      if (!element) {
        return;
      }

      if (isInput(element)) {
        const length = element.value.length;
        const position = end !== undefined ? Math.min(end, length) : length;
        element.setSelectionRange(position, position);
      } else {
        // const range = document.createRange();
        // const selection = window.getSelection();

        // if (startContainer && startContainer.nodeType === Node.TEXT_NODE) {
        //   // 如果存在文本节点
        //   range.setStart(startContainer, startOffset);
        //   range.setEnd(startContainer, end);
        // } else {
        //   // 如果没有文本节点，直接选择元素内容
        //   range.selectNodeContents(startContainer);
        //   range.collapse(false); // 折叠到内容末尾
        // }

        // selection.removeAllRanges();
        // selection.addRange(range);
        // element.focus();
      }
    } catch (e) {
      console.log(e);
    }
  }


  const inertOrCopy = async (translation: string) => {
    if (isInput(currentEditableElement)) {
      const range = {
        element: currentEditableElement,
        start: startOffset,
        end: endOffset,
      }
      await replaceText(range, translation);
      // 
      moveCursorToEnd(currentEditableElement, startOffset + translation.length);
      startOffset = startOffset + translation.length;

    } else if (currentEditableElement && currentEditableElement.isContentEditable === true) {
      await replaceTextInContentEditable(currentEditableElement, translation)
      moveCursorToEnd(currentEditableElement, startOffset + translation.length);
      startOffset = startOffset + translation.length;
    }
    else {
      const content = translation.replace(/^\s+|\s+$/g, '');
      await copyContent(content);
    }
  }

  async function replaceTextInContentEditable(
    element: HTMLElement,
    text: string
  ) {
    try {
      const selection = window.getSelection();
      const range = document.createRange();
      // 设置 Range 的起始和结束
      // console.log('startContainer', startContainer);

      range.setStart(startContainer, startOffset);
      range.setEnd(startContainer, endOffset);

      // 清除之前的所有选区并添加新的 Range
      selection.removeAllRanges();
      selection.addRange(range);

      // 替换文本
      await replaceText(range, text);

    } catch (e) {
      console.error("Error replacing text:", e);
    }
  }

  function getCaretPositionInContentEditable() {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      return {
        range,
        startContainer: range.startContainer,
        startOffset: range.startOffset,
        endOffset: range.endOffset
      };
    }
    return null;
  }

  function getCaretPosition(element: any) {
    if (element.nodeName === 'INPUT' || element.nodeName === 'TEXTAREA') {
      const caretPos = {
        startOffset: element.selectionStart,
        endOffset: element.selectionEnd
      };
      return caretPos;
    } else if (element.isContentEditable) {
      return getCaretPositionInContentEditable();
    }
    return null;
  }

  function setStartPosition() {
    const position: any = getCaretPosition(currentEditableElement);
    // console.log('position', position);
    if (position) {
      startOffset = position.startOffset;
      startContainer = position.startContainer;

      // console.log('起始位置:', startOffset);
      // console.log('startContainer:', startContainer);
    }
  }

  function getInsertedText(element: any) {
    if (element.nodeName === 'INPUT' || element.nodeName === 'TEXTAREA') {
      const text = element.value.substring(startOffset, endOffset);
      return text;
    } else if (element.isContentEditable) {
      const position = getCaretPositionInContentEditable();
      if (position) {
        const range = document.createRange();
        range.setStart(position.startContainer, startOffset);
        range.setEnd(position.startContainer, position.endOffset);
        return range.toString();
      }
    }
    return '';
  }

  function isInput(element: any) {
    return element.tagName.toLowerCase() === 'input' || element.tagName.toLowerCase() === 'textarea';
  }
  const onTab = async (event: any) => {
    if (event.key === 'Tab') {
      event.preventDefault();
      if (statusRef.current === 'inputing') {

        const inputText = inputRef.current.value;
        if (!inputText.trim()) {
          return;
        }

        setRefStatus('translating');
        const language = getLanguage(lang)
        await improveWriting({
          text: inputText, language,
          tone,
          isTranslate,
          expand,
          emoji,
          grammar
        }, (done, result) => {
          const content = result.content;
          if (content) {
            setTranslateText(content);
          }
          if (done && content) {
            setRefStatus('translated');
          }
        });

        return;
      } else if (statusRef.current === 'translated') {
        if (transTextEle.current) {
          const translation = transTextEle.current.innerText;
          await inertOrCopy(translation);
        }
        reset();
      }

    } else if (event.key === 'Enter') {
      setTimeout(() => {
        setStartPosition();
      }, 0);
    }
  }

  function init() {
    function focusin(event: any) {
      if (event.target.id === 'sally-input') {
        return;
      }
      const tagName = event.target.tagName.toLowerCase();
      if (tagName === 'input' || tagName === 'textarea' || event.target.isContentEditable === true) {
        currentEditableElement = event.target;
      }
    }
    function focusout(event: any) {
      // const tagName = event.target.tagName.toLowerCase();
      // if (tagName === 'input' || tagName === 'textarea' || event.target.isContentEditable) {
      //   currentEditableElement = null;
      //   historyContent = '';
      // }
    }

    const onInput = debounce(async (e) => {
      const position: any = getCaretPosition(currentEditableElement);
      // 每次输入时，更新endOffset
      endOffset = position.endOffset;
      startContainer = position.startContainer;
      if ((endOffset <= startOffset)) {
        startOffset = endOffset;
        reset();
        return;
      }

      const insertedText = getInsertedText(currentEditableElement);
      if (insertedText) {
        setInputText(insertedText);
      }

    }, 100);

    async function onKeydown(event: any) {
      onTab(event);
    }

    function onMouseDown(event: any) {
      setTimeout(() => {
        setStartPosition();
      }, 0);
    }

    document.body.addEventListener('focusin', focusin);
    document.body.addEventListener('focusout', focusout);
    document.body.addEventListener('input', onInput);
    document.body.addEventListener('keydown', onKeydown);
    document.body.addEventListener('mousedown', onMouseDown);

    currentEditableElement = document.activeElement;

    return () => {
      document.body.removeEventListener('focusin', focusin);
      document.body.removeEventListener('focusout', focusout);
      document.body.removeEventListener('input', onInput);
      document.body.removeEventListener('keydown', onKeydown);
      document.body.removeEventListener('mousedown', onMouseDown);
    }
  }
  const onLanChange = (value: string) => {
    setLang(value);
  }
  const onToneChange = (value: string) => {
    setTone(value);
  }
  const onSent = async () => {
    const inputText = inputRef.current.value;
    if (!inputText) {
      return;
    }
    setRefStatus('translating');
    const diffText = inputText;
    const language = getLanguage(lang)
    await improveWriting({
      text: diffText, language,
      tone, isTranslate, expand, emoji, grammar
    }, (done, result) => {
      const content = result.content;
      setTranslateText(content);
      if (done && content) {
        setRefStatus('translated');
      }
    });
  }
  const onClear = () => {
    reset();
  }
  const onOpen = () => {
    const position: any = getCaretPosition(currentEditableElement);
    if (position) {
      startOffset = position.startOffset;
      startContainer = position.startContainer;
    }
  }

  useEffect(() => {
    const unregist = init();
    return () => {
      unregist();
    }
  }, [isTranslate, expand, lang, emoji])


  useEffect(() => {
    onOpen();
  }, [selectedText])

  useEffect(() => {
    setInputText(selectedText)
  }, [selectedText])

  return (
    <div className='w-full'>
      <div className="flex flex-row items-center w-full py-2">
        <Checkbox className={styles.checkboxInput} checked={isTranslate} onChange={(checked) => {
          setIsTranslate(checked);
        }} />
        <LanguageList className='w-24' value={lang} onChange={onLanChange} />
        <ToneList value={tone} className=" w-24 ml-2" onChange={onToneChange} />
        <Checkbox checked={expand} onChange={(checked) => {
          setExpand(checked);
        }} />
        <label htmlFor='expand' className={styles.label} onClick={() => {
          setExpand(!expand);
        }}>
          {t('make_longer')}
        </label>
        <Checkbox className={styles.checkboxInput} checked={emoji} onChange={(checked) => {
          setEmoji(checked);
        }} />
        <label htmlFor='emoji' className={styles.label} onClick={() => {
          setEmoji(!emoji);
        }}>
          Emoji
        </label>
      </div>
      <div className={styles.inputBar}>
        <Textarea
          ref={inputRef}
          rows={3}
          id="sally-input"
          value={inputText}
          onChange={e => {
            e.stopPropagation();
            setInputText(e.target.value);
            if (status !== 'inputing') {
              setTranslateText('');
              setStatus('inputing')
              statusRef.current = 'inputing';
            }
          }}
          className=' rounded'
          placeholder={t('input.placeholder')}
          onSelect={(e) => e.stopPropagation()}
          onInput={e => e.stopPropagation()}
          onKeyDown={onTab}
        />
      </div>
      <div className={styles.toolBar} >
        <Button loading={status == 'translating'} disabled={status === 'translating'} className={cn(styles.primaryButton, status === 'translating' ? styles.disabledButton : '')} onClick={onSent}>
          Tab
        </Button>
        <Button onClick={onClear}>
          {t('clear')}
        </Button>
        <div style={{ flex: 1 }}></div>
      </div>
      <div className={styles.textWarper}>
        {
          translateText && (
            <div className={styles.selectedTextWarper}>
              <span style={{
                float: 'left'
              }}>
                [{translateText.length}]
              </span>
              <span ref={transTextEle} className={styles.selectedText}  >
                {translateText}
              </span>
            </div>

          )
        }
      </div>
      {
        translateText && (
          <div className='flex flex-row space-x-2 items-center justify-center'>
            <ReplaceAction selectedRange={selectedRange} text={translateText} />
            <InsertAction selectedRange={selectedRange} text={translateText} />
            <CopyAction text={translateText} />
            <ReplayAction onClick={onSent} />
          </div>
        )
      }
    </div>
  );
};

export default App;
