/* eslint-disable react/display-name */
import React, {
  useState,
  useRef,
  useImperativeHandle,
  useCallback,
  useEffect,
} from 'react';
import clsx from 'clsx';
import { LiveAudioVisualizer } from 'react-audio-visualize';

import { Action } from './Action';
import useLocalStore from 'chat-list/hook/useLocalStore';
import LANGUAGES from 'chat-list/data/speech-to-text/language';
import LanguageList from 'chat-list/components/language-list';
import { Mic, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

let ts = 0;

export interface RecorderHandle {
  stop: () => void;
}

let finalTranscript = '';

export interface RecorderProps {
  canRecord?: boolean;
  volume?: number;
  onStart?: () => void;
  onEnd?: (data: { data: Blob; duration: number }) => void;
  onCancel?: () => void;
  onOutput?: (data: string) => void;
  ref?: React.MutableRefObject<RecorderHandle>;
}

export const Recorder = React.forwardRef<RecorderHandle, RecorderProps>(
  (props) => {
    const { onStart, onEnd, onCancel, onOutput, ref } = props;
    const { t } = useTranslation();

    const [status, setStatus] = useState<'inited' | 'recording' | 'cancel'>(
      'inited'
    );
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const btnRef = useRef<HTMLDivElement>(null);
    const [recognizing, setRecognizing] = useState(false);
    const { value: language, setValue: setLanguage } = useLocalStore('SPEECH_RECOGNITION_LNG', 'en-US');
    // const { value: langVisible, setValue: setLangVisible } = useLocalStore('SPEECH_RECOGNITION_VISIBLE', '1');
    const [langVisible, setLangVisible] = useState(1);
    const [openLangSelect, setOpenLangSelect] = useState(false);
    const recognizer = useRef(null);
    const timer = useRef(null);
    const doEnd = useCallback(
      (data: Blob) => {
        const duration = Date.now() - ts;

        if (onEnd && duration > 1000) {
          onEnd({ duration, data });
        } else {
          // toast.show('Your recording is too short.', 'error');
        }
      },
      [onEnd]
    );

    useImperativeHandle(ref, () => ({
      stop() {
        setStatus('inited');
        doEnd(null);
        ts = 0;
      },
    }));

    const initRecognizer = () => {

      if (!recognizer.current) {
        recognizer.current = new window.webkitSpeechRecognition();

      }
      const recognition = recognizer.current;
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = function () {
        setRecognizing(true);
      };

      recognition.onerror = function (event: Error) {
        console.error(event);
      };

      recognition.onend = function () {
        finalTranscript = '';
        setRecognizing(false);
      };

      recognition.onresult = function (event: any) {
        let interimTranscript = '';
        if (typeof event.results == 'undefined') {
          recognition.onend = null;
          recognition.stop();
          return;
        }
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        onOutput?.(finalTranscript || interimTranscript);
      };
      recognizer.current = recognition;
    };

    // const wrapper = btnRef.current!;
    const onRecorderStart = async () => {
      const audioChunks: any[] = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream);
      setMediaRecorder(mediaRecorder);
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        if (audioChunks.length > 0) {
          //   transToText(audioChunks);
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          doEnd(audioBlob);
        }
      };

      mediaRecorder.start();
    };

    const handleTouchStart: React.MouseEventHandler<HTMLButtonElement> = (
      e
    ) => {
      if (e.cancelable) {
        e.preventDefault();
      }
      // const touch0 = e.clientY
      //   startY = e.clientY;
      ts = Date.now();
      setStatus('recording');
      onRecorderStart();
      initRecognizer();
      if (recognizing) {

        recognizer.current.stop();
        setRecognizing(false);
        return;
      }
      finalTranscript = '';
      recognizer.current.lang = language;
      recognizer.current.start();

      if (onStart) {
        onStart();
      }
    };

    const handleMouseLeave: React.MouseEventHandler<HTMLButtonElement> = () => {
      if (status === 'recording') {
        setStatus('cancel');
      }
    };

    const handleTouchEnd: React.MouseEventHandler<HTMLButtonElement> = () => {
      if (status == 'recording') {
        if (mediaRecorder) {
          mediaRecorder.stop();
        }

        recognizer.current.stop();
        setMediaRecorder(null);
      } else if (onCancel) {
        onCancel();
      }
      setStatus('inited');
    };

    const changeLanguage = (val: string) => {
      setLanguage(val);
    };
    const onSelectLang = () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
    // useEffect(() => {
    //  initRecognizer();
    //   return () => {

    //   }
    // }, [onOutput]);

    useEffect(() => {
      // if (langVisible == 0) {
      //   if (openLangSelect) {
      //     setOpenLangSelect(false);
      //   }
      //   return;
      // }
      // if (langVisible == 1) {
      if (status === 'recording') {
        setOpenLangSelect(true);
      } else {
        if (timer.current) {
          clearTimeout(timer.current);
        }
        timer.current = setTimeout(() => {
          setOpenLangSelect(false);
        }, 3000);
      }
      // }

    }, [status]);
    // const wavesStyle = { transform: `scale(${(volume || 1) / 100 + 1})` };
    return (
      <>
        <Action
          data-icon="mic"
          icon={Mic}
          title={t('base:common.press_and_talk')}
          onMouseLeave={handleMouseLeave}
          onMouseDown={handleTouchStart}
          //   onMouseEnter={handleMouseEnter}
          onMouseUp={handleTouchEnd}
          aria-label="speech to text"
          iconClassName={`${status === 'recording' ? 'text-primary' : ''}`}
        />
        {status === 'recording' && (
          <div className={clsx('Recorder')} ref={btnRef}>
            <div
              className="flex flex-col fixed left-1/2 top-1/2  -translate-x-1/2 -translate-y-1/2 bg-slate-700 p-2 trn h-12 w-32 shadow rounded-full"
            >
              {mediaRecorder && (
                <LiveAudioVisualizer
                  mediaRecorder={mediaRecorder}
                  width={100}
                  height={30}
                  barColor="#4da953"
                  barWidth={5}
                />
              )}
            </div>
          </div>
        )}
        {openLangSelect && (
          <div
            className="flex flex-row fixed items-center left-1/2 bottom-1/4 -translate-x-1/2 bg-slate-700 p-1 trn shadow text-white rounded"
            onClick={onSelectLang}
          >
            <LanguageList languages={LANGUAGES} value={language} onChange={changeLanguage} />
            <XCircle className="ml-1 cursor-pointer" onClick={() => setOpenLangSelect(false)} />
          </div>
        )}
      </>
    );
  }
);
