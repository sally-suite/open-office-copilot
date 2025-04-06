/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useEffect } from 'react';
import data from '@emoji-mart/data'
// import 'emoji-mart/css/emoji-mart.css';
import Picker from '@emoji-mart/react'


import { IPluginComponentProps } from '../types';
import { insertText } from 'chat-list/utils/writing';

const App = (props: IPluginComponentProps) => {
  const { selectedRange } = props;

  const onChange = async (emoji: any) => {
    insertText(selectedRange, emoji.native);
  };
  useEffect(() => {
    const emojiPicker = document.querySelector('sally-assistant').shadowRoot.querySelector('em-emoji-picker') as HTMLElement;
    // 设置emojiPicker的样式
    if (emojiPicker) {
      emojiPicker.style.boxShadow = 'none';
      emojiPicker.style.width = '100%';
    }
  }, [])
  return (
    <Picker onEmojiSelect={onChange} data={data} />
  );
};

export default App;
