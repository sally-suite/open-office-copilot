import React, { useRef } from 'react';
import toast from "chat-list/components/ui/use-toast";
import Setting, { ILangItem } from './setting';
import useChatState from 'chat-list/hook/useChatState';
import { buildTransLateDocMessages } from 'chat-list/service/doc';
import docApi from '@api/slide';
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
    target,
    mode,
    style,
  }: {
    target: ILangItem;
    mode: 'overwrite' | 'new-sheet';
    style: string;
  }) => {
    if (!target) {
      toast.fail('Please select target language');
      return;
    }
    await translateDocByGpt(
      '',
      target.text,
      mode,
      style
    );
  };
  return (
    <Setting
      title="Translate Doc"
      description=""
      onChange={onTransSet}
    />
  );
});
