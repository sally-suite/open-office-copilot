import React, { useState } from 'react';
import toast from "chat-list/components/ui/use-toast";
import Setting, { ILangItem } from './setting';
import useChatState from 'chat-list/hook/useChatState';
import { buildTransLateDocMessages, translateDocByGoogle } from 'chat-list/service/doc';
import docApi from '@api/doc';
import { IMessageBody } from 'chat-list/types/chat';
import Markdown from '../markdown';

export default React.memo(function CardTranslate() {
  const { chat, platform } = useChatState();
  const [result, setResult] = useState('');

  async function translateDocByGpt(sourceLanguage: string, targetLanguage: string, mode: string, style: string) {
    const text = await docApi.getSelectedText();
    const messages = buildTransLateDocMessages(
      text,
      sourceLanguage,
      targetLanguage,
      style
    ) as IMessageBody[];

    await chat({
      stream: true,
      messages,
      temperature: 0,
    }, (done, result) => {
      if (!result || !result.content) {
        return;
      }
      setResult(result.content);
    });
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
    if (!target) {
      toast.fail('Please select target language');
      return;
    }
    let result = '';
    if (platform == 'google' && (!engine || engine === 'google')) {
      result = await translateDocByGoogle(source?.value || '', target.value);
      setResult(result);
    } else {
      await translateDocByGpt(
        source?.value || '',
        target.value,
        mode,
        style
      );
    }
  };
  return (
    <div className='p-2'>
      <Setting
        onChange={onTransSet}
      />
      <Markdown>
        {result}
      </Markdown>
    </div>
  );
});
