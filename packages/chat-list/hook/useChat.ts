import { IChatBody, IMessageBody, Role } from 'chat-list/types/chat';
import { useRef, useState } from 'react';
import { chat } from 'chat-list/service/message'
import { IModelConfig } from 'chat-list/types/plugin';
export const useChat = () => {
  const [typing, setTyping] = useState(false)
  const [response, setResponse] = useState({ done: true, text: '', isFirst: false });
  const abortFunc = useRef(null);
  const isFirst = useRef(true);
  const streaming = useRef(false)

  const chatComplete = async (messages: IMessageBody[], options: IModelConfig) => {
    setTyping(true);
    // appendMessage('assistant', '...')
    const chatBody: IChatBody = {
      messages,
      temperature: options.temperature,
    };
    await chat(chatBody, (done, text, stop) => {
      if (!streaming.current) {
        streaming.current = true;
      }

      abortFunc.current = stop;
      if (isFirst.current) {
        isFirst.current = false;
        setResponse({ text, done, isFirst: true });
        return;
      }

      if (done) {
        setResponse({ text, done, isFirst: false });
        setTyping(false);
        setTimeout(() => {
          setResponse({ text: '', done: true, isFirst: false });
          isFirst.current = true;
          streaming.current = false;
        }, 0)
        return;
      }
      setResponse({ text, done, isFirst: false });
    })
    setTyping(false);
  }


  const submit = (messages: IMessageBody[], options: IModelConfig) => {
    // appendMessage('user', input);
    chatComplete(messages, options);
  }

  return {
    typing,
    streaming,
    isFirst,
    response,
    submit,
    abort() {
      if (abortFunc.current) {
        abortFunc.current();
      }
    }
  };
};

export default useChat;
