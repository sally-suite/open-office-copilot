import React, { useRef } from 'react';
import toast from "chat-list/components/ui/use-toast";
import Setting, { ILangItem } from './setting';
import useChatState from 'chat-list/hook/useChatState';
import { buildTransLateDocMessages, translateDocByGoogle } from 'chat-list/service/doc';
import docApi from '@api/doc';
import { IMessageBody } from 'chat-list/types/chat';

interface ICardTranslateDocProps {
  onTranslate: (text: string) => void;
}

export default React.memo(function CardTranslate({ onTranslate }: ICardTranslateDocProps) {
  const { chat, platform, showMessage, setTyping } = useChatState();
  const lastMsg = useRef(null);
  async function translateDocByGpt(sourceLanguage: string, targetLanguage: string, mode: string, style: string) {
    const text = await docApi.getSelectedText();

    const messages = buildTransLateDocMessages(
      text,
      sourceLanguage,
      targetLanguage,
      style
    ) as IMessageBody[];
    if (lastMsg.current) {
      lastMsg.current.delete();
    }
    const msg = showMessage('', 'assistant');
    lastMsg.current = msg;
    const result = await chat({
      messages,
      temperature: 0.7,
      stream: true,
    }, (done, result, stop) => {
      if (!result.content) {
        return;
      }
      msg.update(result.content);
      if (done) {
        msg.update(result.content);
      }
    });

    return result.content;
  }

  const onTransSet = async ({
    source,
    target,
    engine,
    mode,
    style,
  }: {
    source: ILangItem;
    target: ILangItem;
    engine: 'google' | 'gpt';
    mode: 'overwrite' | 'new-sheet';
    style: string;
  }) => {
    // console.log('source', source)
    // console.log('target', target)
    // console.log('engine', engine)
    // console.log('mode', mode)
    // console.log('style', style)
    if (!target) {
      toast.fail('Please select target language');
      return;
    }
    let result = '';
    if (platform == 'google' && (!engine || engine === 'google')) {
      result = await translateDocByGoogle(source?.value || '', target.value);
      if (result) {
        onTranslate?.(result);
      }
    } else {
      await translateDocByGpt(
        source?.text || '',
        target.text,
        mode,
        style
      );
    }

  };
  return (
    <Setting
      title="Translate Doc"
      description=""
      onChange={onTransSet}
    />
  );
});
