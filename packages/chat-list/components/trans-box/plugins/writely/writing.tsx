/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, CornerDownRight, StopCircle, X } from 'lucide-react';
import { Input } from 'chat-list/components/ui/input';
import { SendButton } from 'chat-list/components/composer/Composer/SendButton';
import writing, { tools, searchImage, generateImage } from 'chat-list/service/writing'
import Markdown from '../../markdown';
import ReplaceAction from '../../actions/Replace';
import CopyAction from '../../actions/Copy';
import InsertAction from '../../actions/Insert';
import ReplayAction from '../../actions/Replay';

import { IPluginComponentProps } from '../types';
import { useTranslation } from 'react-i18next';
import { getDocumentContent, insertImage } from 'chat-list/utils/writing';
import { throttle } from 'chat-list/utils';
import { chatByPrompt } from 'chat-list/service/message';
import { TRANSLATE_STYLE } from 'chat-list/data/translate/languages';
import { cn } from 'chat-list/lib/utils';
import prompts from 'chat-list/service/writing/prompt';

type IStatus = 'inputing' | 'processing' | 'completed';


const App = (props: IPluginComponentProps) => {
  const { selectedText: text, selectedRange } = props;
  const [outputText, setOutputText] = useState('');
  const [status, setStatus] = useState<IStatus>('inputing');
  const statusRef = useRef<IStatus>('inputing');
  const [inputText, setInputText] = useState('')
  const [otherRequest, setOtherRequest] = useState('');
  const [selectedText, setSelectedText] = useState(text);

  const resultRef = useRef(null);
  const [currentAction, setCurrentAction] = useState<string>(null);
  const inputRef = useRef(null);
  const otherInputRef = useRef(null);

  const stopRef = useRef(null);
  const { t } = useTranslation(['side', 'translate'])
  const [showTone, setShowTone] = useState<{ top?: number, visible: boolean }>({
    top: 0,
    visible: false,
  });

  const onSent = async () => {
    if (!inputText) {
      return;
    }
    setCurrentAction('');
    setStatus('processing');
    if (!selectedText) {
      await chatByPrompt("", inputText, {
        temperature: 0.7,
        stream: true
      }, (done, result, stop) => {
        stopRef.current = stop;
        setOutputText(result.content);
        scrollToEnd();
        if (done) {
          setStatus('completed');
        }
      });
      return;
    }
    await writing(selectedText, inputText, (done, result, stop) => {
      stopRef.current = stop;
      setOutputText(result.content);
      scrollToEnd();
      if (done) {
        setStatus('completed');
        setTimeout(() => {
          otherInputRef.current?.focus();
        }, 1000)
      }
    })
  }
  const onSentOtherRequest = async () => {
    if (!otherRequest) {
      return;
    }
    setCurrentAction('');
    setStatus('processing');
    await writing(outputText, otherRequest, (done, result, stop) => {
      stopRef.current = stop;
      setOutputText(result.content);
      scrollToEnd();
      if (done) {
        setStatus('completed');
        setOtherRequest('');
        setTimeout(() => {
          otherInputRef.current?.focus();
        }, 1000)
      }
    })
  }

  const scrollToEnd = useCallback(throttle(() => {
    resultRef.current?.scrollTo({ top: resultRef.current?.scrollHeight, behavior: 'smooth' });
  }, 200), [resultRef.current]);

  const onInsertImage = async (img: HTMLImageElement, base64: string) => {
    await insertImage(selectedRange, img, base64);
  }
  const execAction = async (code: any) => {
    setStatus('processing');
    setOutputText('');
    if (code == 'search_image') {
      const content = await searchImage(selectedText);
      setOutputText(content);
      setStatus('completed');
      return;
    } else if (code == 'generate_image') {
      const content = await generateImage(selectedText);
      setOutputText(content);
      setStatus('completed');
      return;
    }
    let content = selectedText;
    if (code == 'summarize' || code === 'make_titles') {
      if (!content) {
        content = await getDocumentContent(selectedRange);
        console.log(content)
      }
    }

    const prompt = (prompts as any)?.[code];
    await writing(content, prompt, (done, result, stop) => {
      stopRef.current = stop;
      if (!result.content) {
        return;
      }

      setOutputText(result.content);
      scrollToEnd();
      if (done) {
        setStatus('completed');
        setTimeout(() => {
          otherInputRef.current?.focus();
        }, 1000)
      }
    })
  }
  const onToolClick = async (tool: any) => {
    setCurrentAction(tool.code);
    await execAction(tool.code);
  }
  const onToolHover = async (tool: any, e: Event) => {
    if (tool.code == 'change_tone') {
      const scrollTop = (e.target as HTMLElement).parentElement.scrollTop;
      setShowTone({
        top: (e.target as HTMLElement).offsetTop - scrollTop,
        visible: true,
      })
    } else {
      setShowTone({
        top: showTone.top,
        visible: false,
      })
    }
  }
  const onChangeTone = async (tone: any) => {
    setOutputText('');
    setStatus('processing');
    setShowTone({
      top: showTone.top,
      visible: false,
    });
    const prompt = 'help me change the tone of the following text to ' + tone;
    await writing(selectedText, prompt, (done, result, stop) => {
      stopRef.current = stop;
      if (!result.content) {
        return;
      }

      setOutputText(result.content);
      scrollToEnd();
      if (done) {
        setStatus('completed');
      }
    })
  }

  const regenerate = async () => {
    setStatus('processing');
    setOutputText('');
    const action = currentAction;
    await execAction(action);
    // console.log(tool)
  }

  const stopGen = () => {
    if (stopRef.current) {
      stopRef.current();
    }
    setStatus('completed');
  }
  const onSuccess = async () => {
    setSelectedText('');
    setStatus('inputing');
  }


  useEffect(() => {
    setSelectedText(text)
  }, [text])

  return (
    <div className='text-base flex flex-col w-full'>
      {
        status === 'inputing' && (
          <>
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
                    setOutputText('');
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
              ></Input>
              <SendButton
                onClick={onSent}
                disabled={!(inputText)}
                className=' absolute right-1 top-1/2 -translate-y-1/2'
              />
            </div>
            <div className='py-1 flex flex-col overflow-auto max-h-80'>
              {
                tools.map((tool, index) => {
                  const Icon = tool.icon;
                  return (
                    <div key={index}
                      className="h-8 flex-shrink-0 flex flex-row items-center justify-start space-x-1 hover:bg-slate-100 hover:cursor-pointer text-sm rounded-sm px-2"
                      onMouseEnter={onToolHover.bind(null, tool)}
                      onClick={onToolClick.bind(null, tool)}
                    >
                      <Icon height={16} width={16} className='inline-block' />
                      <span className='ml-1'>
                        {t(tool.code, { defaultValue: tool.name })}
                      </span>
                    </div>
                  )
                })
              }
            </div>
          </>

        )
      }

      {
        (status === 'processing' || status == 'completed') && (
          <div className='py-1 flex flex-col max-h-96'>
            <div className='flex flex-row items-center cursor-pointer text-sm' onClick={() => {
              setStatus('inputing');
              setOutputText('');
            }}>
              <ChevronLeft height={20} width={20} className='inline-block' />
              <span>
                {t('side:back')}
              </span>
            </div>
            {
              status == 'processing' && (
                <div className='flex flex-row justify-center'>
                  <StopCircle className='text-primary h-8 cursor-pointer pulse' onClick={stopGen} />
                </div>
              )
            }
            {
              outputText && (
                <div ref={resultRef} className='p-1 flex-1 overflow-auto'>
                  <Markdown copyContentBtn={false} onInsertImage={onInsertImage} >
                    {outputText}
                  </Markdown>
                </div>
              )
            }

          </div>
        )
      }


      {
        status === 'completed' && (
          <div className='flex flex-row space-x-2 items-center justify-center'>
            <ReplaceAction selectedRange={selectedRange} text={outputText} onSuccess={onSuccess} />
            <InsertAction selectedRange={selectedRange} text={outputText} onSuccess={onSuccess} />
            <CopyAction text={outputText} />
            <ReplayAction onClick={regenerate} />
          </div>
        )
      }
      {
        status == 'completed' && (
          <div className=" relative flex flex-row items-center justify-center space-x-1">
            <Input
              ref={otherInputRef}
              className='h-8 outline-none focus:outline-none pr-6 rounded-sm'
              id="sally-input"
              value={otherRequest}
              onChange={e => {
                e.stopPropagation();
                setOtherRequest(e.target.value);
              }}
              placeholder='Ask follow-up'
              onSelect={(e) => e.stopPropagation()}
              onInput={e => e.stopPropagation()}
              onKeyDown={(e) => {
                if ((!e.ctrlKey && !e.metaKey) && e.key === 'Enter') {
                  e.preventDefault();
                  e.stopPropagation();
                  onSentOtherRequest();
                }
              }}
            ></Input>
            <SendButton
              onClick={onSentOtherRequest}
              disabled={!(otherRequest)}
              className=' absolute right-1 top-1/2 -translate-y-1/2'
            />
          </div>

        )
      }

      <div className={cn(
        ' absolute -left-[150px] p-1 w-40 bg-white shadow rounded transition-opacity',
        showTone.visible ? " opacity-100" : "opacity-0 pointer-events-none"
      )}
        style={{
          top: showTone.top,
        }}
        onMouseLeave={() => setShowTone({ visible: false, top: showTone.top })}
      >
        {TRANSLATE_STYLE.map((item) => {
          return (
            <div
              className="h-7 flex-shrink-0 flex flex-row items-center justify-start space-x-1 hover:bg-slate-100 hover:cursor-pointer text-sm rounded-sm px-2"
              key={item.value}
              onClick={onChangeTone.bind(null, item.value)}
            >
              {t(`translate:tone.${item.value}`, item.label)}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default App;
