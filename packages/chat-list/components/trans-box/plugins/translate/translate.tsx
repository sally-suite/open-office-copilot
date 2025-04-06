/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useEffect, useRef, useState } from 'react';
import styles from '../../index.module.css';
import { translate } from 'chat-list/service/translate';
// import LanguageList from 'chat-list/components/language-list/selector';
import ToneList from 'chat-list/components/trans-box/trans-style-list/selector';
import useChromeStore from 'chat-list/hook/useChromeStore';
import { getLanguage } from 'chat-list/data/translate/languages';
import ReplaceAction from '../../actions/Replace';
import CopyAction from '../../actions/Copy';
import InsertAction from '../../actions/Insert';
import ReplayAction from '../../actions/Replay';
import { IPluginComponentProps } from '../types';
import { SendButton } from 'chat-list/components/composer/Composer/SendButton';
import { Textarea } from 'chat-list/components/ui/textarea';
import { ArrowRightLeft, ChevronDown, StopCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Container from '../../container';
import LanguageList from './menu';
import useLanguages from './useLanguages'
import Button from '../../button';

type IStatus = 'inputing' | 'translating' | 'translated';

const App = (props: IPluginComponentProps) => {
  const { selectedRange, selectedText, pin, onPin, position, params: defaultParams, onPositionChange, onClose } = props;
  const [translateText, setTranslateText] = useState('');
  const [status, setStatus] = useState<IStatus>('inputing');
  const statusRef = useRef<IStatus>('inputing');
  const [params, setParams] = useState(defaultParams);

  const transTextEle = useRef<HTMLDivElement>();
  // const [lang, setLang] = useState(pageLanguage)
  const { t, i18n } = useTranslation(['translate', 'side']);
  const stopRef = useRef(null);

  const [inputText, setInputText] = useState(selectedText)

  const { langs, loading: langLoading } = useLanguages();
  const [lang, setLang] = useState('');
  const { value: tone, setValue: setTone, loading: toneLoading } = useChromeStore<string>('trans-box-tone', 'formal');

  const inputRef = useRef(null);

  function setRefStatus(sta: IStatus) {
    statusRef.current = sta;
    setStatus(sta)
  }

  // const onLanChange = async (value: string) => {
  //   setLang(value);
  //   await translateToLang(value || i18n.resolvedLanguage, inputText)

  // }
  const onLanChange = async ({ code }: { code: string }) => {
    setLang(code);
    await translateToLang(code || i18n.resolvedLanguage, inputText, tone)
    // setParams({ ...params, code })
  }

  const onToneChange = async (value: string) => {
    setTone(value);
    await translateToLang(lang || i18n.resolvedLanguage, inputText, value)
  }

  const stopGen = () => {
    if (stopRef.current) {
      stopRef.current();
    }
    setRefStatus('translated');
  }
  const translateToLang = async (lang: string, inputText: string, tone?: string) => {
    setRefStatus('translating');
    setTranslateText('');
    const diffText = inputText;
    const language = getLanguage(lang)
    await translate({
      text: diffText,
      language,
      tone: tone || 'formal',
      isTranslate: true,
    }, (done: boolean, result, stop) => {
      stopRef.current = stop;
      const content = result.content;
      setTranslateText(content);
      if (done && content) {
        setRefStatus('translated');
      }
    });
  }
  const regenerate = async () => {
    await translateToLang(lang || i18n.resolvedLanguage, inputText, tone)
  }
  const onSent = async () => {
    await translateToLang(lang || i18n.resolvedLanguage, inputText, tone)
  }

  // useEffect(() => {
  //   setInputText(selectedText);
  //   if (lang) {
  //     translateToLang(lang || i18n.resolvedLanguage, selectedText);
  //   }
  // }, [selectedText, lang])

  useEffect(() => {
    if (!selectedText) {
      return;
    }
    if (langLoading || toneLoading) {
      return;
    }
    setInputText(selectedText);
    if (params.code) {
      setLang(params.code);
      translateToLang(params.code || i18n.resolvedLanguage, selectedText, tone);
    }
  }, [params, selectedText, langLoading, toneLoading])

  useEffect(() => {
    setParams(defaultParams);
  }, [defaultParams])

  return (
    <Container
      title={`${t('side:translation')}`}
      width={450}
      pin={pin}
      onPin={onPin}
      position={position}
      onPositionChange={onPositionChange}
      onClose={onClose}
    >
      <div className='text-base flex flex-col w-full'>
        <div className="flex flex-row items-center w-full mb-2 space-x-2 text-sm">
          {/* <div className='flex flex-row items-center justify-between flex-1'>
            <div className='flex flex-col items-start'>
              <span>{t('from_language_label')}</span>
              <LanguageList className="w-32" value={fromLang} onChange={onFromLanChange} />
            </div>
            <div className='w-4 cursor-pointer' onClick={switchLang}>
              <ArrowRightLeft className='' height={16} width={16} />
            </div>
            <div className='flex flex-col items-start'>
              <span>{t('to_language_label')}</span>
              <LanguageList className="w-32" value={lang} onChange={onLanChange} />
            </div>
          </div> */}
          <div className='flex flex-row items-center'>
            <span className='whitespace-nowrap'>{t('to_language_label')}</span>
            <Button onClick={regenerate} className='flex flex-row items-center h-8 py-0 px-2'>
              <span >
                {langs.find(p => p.value == lang)?.text || lang}
              </span>
              <LanguageList onActive={onLanChange} >
                <span className='border-l border-gray-300 pl-2 h-full flex items-center'>
                  <span className='hover:rotate-180 transition-all duration-200 ease-in-out' >
                    <ChevronDown height={16} width={16} />
                  </span>
                </span>
              </LanguageList>
            </Button>
          </div>
          <div className='flex flex-row items-center'>
            <span className=' whitespace-nowrap'>{t('tone_label')}</span>
            <ToneList value={tone} className=" w-24" onChange={onToneChange} />
          </div>
        </div>
        <div className=" relative flex flex-row items-center justify-center space-x-1">
          <Textarea
            rows={2}
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

        <div className="flex flex-col">
          {
            status == 'translating' && (
              <div className='flex flex-row justify-center'>
                <StopCircle className='text-primary h-8 cursor-pointer pulse' onClick={stopGen} />
              </div>
            )
          }
          {
            ((status == 'translating' || status == 'translated') && translateText) && (
              <div className={styles.selectedTextWarper}>
                <span ref={transTextEle} className={styles.selectedText}  >
                  {translateText || ''}
                </span>
              </div>
            )
          }
        </div>
        {
          status === 'translated' && (
            <div className='flex flex-row space-x-3 items-center justify-center'>
              <ReplaceAction selectedRange={selectedRange} text={translateText} />
              <InsertAction selectedRange={selectedRange} text={translateText} />
              <CopyAction text={translateText} />
              <ReplayAction onClick={onSent} />
            </div>
          )
        }
      </div>
    </Container>
  );
};

export default App;
