import React, { useState, useEffect, useCallback } from 'react';
import riseInput from './riseInput';
import Input, { InputProps } from './Input';

const canTouch = false;// canUse('touch');

interface ComposerInputProps extends InputProps {
  invisible?: boolean;
  inputRef: React.MutableRefObject<HTMLTextAreaElement>;
  onImageSend?: (file: File) => Promise<any>;
}

export const ComposerInput = ({
  inputRef,
  invisible = false,
  onImageSend,
  value,
  ...rest
}: ComposerInputProps) => {


  useEffect(() => {
    if (canTouch && inputRef.current) {
      const $composer = document.querySelector('.Composer');
      riseInput(inputRef.current, $composer);
    }
  }, [inputRef]);
  return (
    // <div >
    <Input
      className="composer-input overflow-auto rounded-md"
      rows={4}
      autoSize
      enterKeyHint="send"
      ref={inputRef}
      value={value}
      {...rest}
    />
    // </div>
  );
};
