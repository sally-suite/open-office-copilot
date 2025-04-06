/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown, StopCircle } from 'lucide-react';
import { Input } from 'chat-list/components/ui/input';
import { SendButton } from 'chat-list/components/composer/Composer/SendButton';
import writing, { } from 'chat-list/service/writing'
import Markdown from '../../markdown';
import ReplaceAction from '../../actions/Replace';
import CopyAction from '../../actions/Copy';
import InsertAction from '../../actions/Insert';
import ReplayAction from '../../actions/Replay';

import { IPluginComponentProps } from '../../plugins/types';
import { useTranslation } from 'react-i18next';
import { insertImage } from 'chat-list/utils/writing';
import { throttle } from 'chat-list/utils';
import prompts from 'chat-list/service/latex/prompt';
import Container from '../../container';
import Button from '../../button';
import commonPrompt from './common.md';
import Menu from './menu'
// import sample from '../edit/sample.md'

type IStatus = 'inputing' | 'processing' | 'completed';


const App = (props: IPluginComponentProps) => {
  const { selectedText, selectedRange, params: defaultParams, pin, onPin, position, onPositionChange, onClose } = props;
  const [outputText, setOutputText] = useState('');
  const [status, setStatus] = useState<IStatus>('inputing');
  const [otherRequest, setOtherRequest] = useState('');

  const resultRef = useRef(null);
  const [currentAction, setCurrentAction] = useState<{ code: string }>(null);
  const otherInputRef = useRef(null);
  const inputRef = useRef(selectedText);
  const stopRef = useRef(null);
  const [params, setParams] = useState(defaultParams);

  const { t } = useTranslation(['side', 'latex'])


  const onSentOtherRequest = async () => {
    if (!otherRequest) {
      return;
    }
    setCurrentAction(null);
    setStatus('processing');
    await writing(outputText || selectedText, otherRequest, (done, result, stop) => {
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

    const content = selectedText;
    const prompt = (prompts as any)?.[code] + '\n\n' + commonPrompt;
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


    // setTimeout(() => {
    //   setOutputText(sample)
    //   setStatus('completed');
    //   otherInputRef.current?.focus();
    // }, 2000)
  }
  const onToolClick = async (tool: any) => {
    await execAction(tool.code);
  }

  const regenerate = async () => {
    setStatus('processing');
    setOutputText('');
    const action = currentAction;
    await onToolClick(action)
    // console.log(tool)
  }

  const stopGen = () => {
    if (stopRef.current) {
      stopRef.current();
    }
    setStatus('completed');
  }
  const onSuccess = async () => {
    // setSelectedText('');
    // setStatus('inputing');
    // onClose?.();
  }

  useEffect(() => {
    if (!selectedText) {
      return;
    }
    setCurrentAction(params);
    onToolClick(params)
  }, [params])

  useEffect(() => {
    setParams(defaultParams);
  }, [defaultParams])

  useEffect(() => {
    if (!selectedText) {
      return;
    }
    if (inputRef.current && inputRef.current != selectedText) {
      setStatus('inputing');
      // setOutputText('');
    }
    inputRef.current = selectedText;
  }, [selectedText])

  const Icon = params.icon;

  return (
    <Container
      title={`${t('latex')}`}
      width={450}
      pin={pin}
      onPin={onPin}
      position={position}
      onPositionChange={onPositionChange}
      onClose={onClose}
    >
      <div className='text-base flex flex-col w-full'>
        <div className='bg-gray-100 p-2 rounded overflow-hidden text-ellipsis whitespace-nowrap text-sm'>
          {selectedText ? `[${selectedText.length}]${selectedText}` : t("no_text_selected")}
        </div>
        {
          (status === 'processing' || status == 'completed' || status == 'inputing') && (
            <div className='py-1 flex flex-col max-h-96'>
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
                    <Markdown selectedRange={selectedRange} copyContentBtn={false} onInsertImage={onInsertImage} >
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
            <div className='flex flex-row space-x-3 items-center justify-center'>
              <ReplaceAction selectedRange={selectedRange} text={outputText} onSuccess={onSuccess} />
              <InsertAction selectedRange={selectedRange} text={outputText} onSuccess={onSuccess} />
              <CopyAction text={outputText} />
              <ReplayAction onClick={regenerate} />
            </div>
          )
        }
        {
          (status == 'completed' || status == 'inputing') && (
            <div className=" relative flex flex-row items-center justify-center space-x-1 mt-1">
              <Button onClick={regenerate} className='flex flex-row items-center h-8 py-0 px-2'>
                <Icon width={16} height={16} />
                <Menu
                  onActive={(params) => {
                    setParams(params);
                  }}
                >
                  <span className='border-l border-gray-300 pl-2 h-full flex items-center'>
                    <span className='hover:rotate-180 transition-all duration-200 ease-in-out' >
                      <ChevronDown height={16} width={16} />
                    </span>
                  </span>
                </Menu>
              </Button>
              <Input
                ref={otherInputRef}
                className='h-8 outline-none focus:outline-none pr-6 rounded'
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
      </div>
    </Container>
  );
};

export default App;
