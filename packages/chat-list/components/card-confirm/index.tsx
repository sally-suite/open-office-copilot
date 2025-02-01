import React, { useState, useEffect } from 'react';
import { Button } from 'chat-list/components/ui/button';

interface ICardConfirmProps {
  title?: string;
  content: string | React.ReactNode;
  okText?: string;
  cancelText?: string;
  hideCancel?: boolean;
  onOk?: () => void;
  onCancel?: () => void;
}

export function CardConfirm(props: ICardConfirmProps) {
  const { title, content, okText, cancelText, hideCancel = false, onOk = () => void 0, onCancel = () => void 0 } = props;
  const [showOkButton, setShowOkButton] = useState(false);
  const [showCancelButton, setShowCancelButton] = useState(false);

  useEffect(() => {
    const okTimer = setTimeout(() => setShowOkButton(true), 100);
    const cancelTimer = setTimeout(() => setShowCancelButton(true), 200);

    return () => {
      clearTimeout(okTimer);
      clearTimeout(cancelTimer);
    };
  }, []);

  return (
    <div className="flex flex-col">
      {content && <div>{content}</div>}
      <div className='flex flex-col items-end space-y-2 mt-2 '>
        <div className={`transform transition-all duration-500 ease-out ${showOkButton ? 'translate-y-0' : 'translate-y-full'}`}>
          <Button variant="default" size='sm' className='w-auto sm:w-auto md:w-auto' onClick={onOk}>
            {okText || 'Ok'}
          </Button>
        </div>
        {!hideCancel && (
          <div className={`transform transition-all duration-500 ease-out ${showCancelButton ? 'translate-y-0' : 'translate-y-full'}`}>
            <Button variant='secondary' size='sm' className='w-auto sm:w-auto md:w-auto' onClick={onCancel}>
              {cancelText || 'Cancel'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default React.memo(CardConfirm);