/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StopCircle } from 'lucide-react';
import { Input } from 'chat-list/components/ui/input';
import { SendButton } from 'chat-list/components/composer/Composer/SendButton';
import writing, { searchImage, generateImage } from 'chat-list/service/writing'
import Markdown from '../../markdown';
import ReplaceAction from '../../actions/Replace';
import CopyAction from '../../actions/Copy';
import InsertAction from '../../actions/Insert';
import ReplayAction from '../../actions/Replay';

import { IPluginComponentProps } from '../../plugins/types';
import { useTranslation } from 'react-i18next';
import { getDocumentContent, insertImage } from 'chat-list/utils/writing';
import { throttle } from 'chat-list/utils';
// import { TRANSLATE_STYLE } from 'chat-list/data/translate/languages';
// import { cn } from 'chat-list/lib/utils';
import prompts from 'chat-list/service/writing/prompt';
import Container from '../../container';

type IStatus = 'inputing' | 'processing' | 'completed';

interface WriteProps extends IPluginComponentProps {
  tool: any
}

const App = (props: WriteProps) => {
  const { pin, onPin, onClose, selectedText: text, selectedRange, position, onPositionChange } = props;
  const [outputText, setOutputText] = useState('');
  const [status, setStatus] = useState<IStatus>('inputing');
  const [otherRequest, setOtherRequest] = useState('');
  const [selectedText, setSelectedText] = useState(text);
  // const [boxPosition, setBoxPosition] = useState({ top: 0, left: 0 })

  const resultRef = useRef(null);
  const [currentAction, setCurrentAction] = useState<string>(null);
  const otherInputRef = useRef(null);

  const stopRef = useRef(null);
  const { t } = useTranslation(['side', 'translate'])
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
  const onToolClick = async () => {
    setCurrentAction('explaination');
    await execAction('explaination');
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

  useEffect(() => {
    onToolClick()
  }, [selectedText])

  return (
    <Container
      title={`${t('explanation')}`}
      width={450}
      pin={pin}
      onPin={onPin}
      position={position}
      onPositionChange={onPositionChange}
      onClose={onClose}
    >
      <div className='text-base flex flex-col w-full'>
        <div className='bg-gray-100 p-2 rounded overflow-hidden text-ellipsis whitespace-nowrap text-sm'>
          {selectedText}
        </div>
        {
          (status === 'processing' || status == 'completed') && (
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
            <div className='flex flex-row space-x-3 items-center justify-center'>
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

      </div>
    </Container>

  );
};

export default App;
