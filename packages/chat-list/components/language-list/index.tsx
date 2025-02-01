import React, { useEffect, useState } from 'react';
import Modal from 'chat-list/components/modal'
import { LANGUAGE_MAP } from 'chat-list/data/translate/languages';
import { ILangItem } from 'chat-list/types/translate';
import { useTranslation } from 'react-i18next'
import { cn } from 'chat-list/lib/utils';
interface LanguageListProps {
  languages?: ILangItem[];
  value: string;
  placeholder?: string;
  onChange: (value: string, text: string) => void;
  className?: string;
}

export default function LanguageList(props: LanguageListProps) {
  const { value = '-', languages = LANGUAGE_MAP, placeholder = 'Select language', onChange, className } = props;
  const [open, setOpen] = useState(false);
  const { t } = useTranslation(['translate', 'language']);
  const [current, setCurrent] = useState<ILangItem>(null);
  function handleClose() {
    setOpen(false);
  }
  const onLngSelect = (item: ILangItem) => {
    setCurrent(item);
    setOpen(false);
    if (onChange) {
      onChange(item.value, item.text);
    }
  };
  const showList = () => {
    setOpen(true);
  };
  useEffect(() => {
    if (value) {
      const item = languages.find((p) => p.value === value);
      setCurrent(item);
    }
  }, [value]);
  return (
    <>
      <div className={cn("px-3 py-1 cursor-pointer rounded-md shadow-sm border border-input whitespace-nowrap", className)} onClick={showList}>
        {!current && <span className=" text-gray-300">{t('select_language', "Select Languate") || placeholder}</span>}
        {current && t(`language:${current.value || "-"}`)}
      </div>
      <Modal
        open={open}
        title={t('translate:select_language', "Select Languate")}
        closeText={t('translate:close', "Close")}
        showClose={true}
        onClose={handleClose}
        showConfirm={false}
      >
        <div className="list">
          {languages.map((lng) => {
            return (
              <div
                className={`list-item ${current?.value === lng.value ? 'selected' : ''
                  }`}
                key={lng.text}
                content={lng.text}
                onClick={onLngSelect.bind(this, lng)}
              >
                <span className='text-sm'>{t(`language:${lng.value || "-"}`)}</span>
                <span className='text-xs text-gray-600'>{lng.text}</span>
              </div>
            );
          })}
        </div>
      </Modal>
    </>
  );
}
