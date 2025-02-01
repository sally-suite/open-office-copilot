import React, { useEffect, useState } from 'react';
import Modal from 'chat-list/components/modal'
import { ILangItem } from 'chat-list/types/translate';
import { useTranslation } from 'react-i18next'
import { languages } from 'chat-list/locales/i18n'
import useChatState from 'chat-list/hook/useChatState';
import useLocalStore from 'chat-list/hook/useLocalStore';
import sheetApi from '@api/sheet'
import docApi from '@api/doc'
import slideApi from '@api/slide'

interface LanguageListProps {
  value?: string;
  placeholder?: string;
  onChange?: (value: string, text: string) => void;
  className?: string;
}

export default function LanguageList(props: LanguageListProps) {
  const { value = '-', onChange, className } = props;
  const [open, setOpen] = useState(false);
  const { platform, docType } = useChatState();
  const { value: lang, setValue: setLang } = useLocalStore<string>('sheet-chat-lang', '');

  const { t, i18n } = useTranslation(['translate', 'language']);

  const [current, setCurrent] = useState<string>(i18n.resolvedLanguage);
  async function handleClose() {
    // if (!lang && !i18n.resolvedLanguage) {
    //   setLang('en-US');
    //   await i18n.changeLanguage('en-US');
    // }
    setOpen(false);
  }
  const onLngSelect = async (lng: string) => {
    setLang(lng);
    await i18n.changeLanguage(lng);
    setOpen(false);
    if (platform === 'google') {
      if (docType === 'sheet') {
        // console.log('showSidePanel', docType)
        await sheetApi.showSidePanel('sheet-chat', 'sheet')
      } else if (docType === 'doc') {
        // console.log('showSidePanel', docType)
        await docApi.showSidePanel('doc-chat', 'doc')
      } else if (docType === 'slide') {
        // console.log('showSidePanel', docType)
        await slideApi.showSidePanel('slide-chat', 'slide')
      }
    } else {
      window.location.reload();
    }
  };

  useEffect(() => {
    if (!lang) {
      // setLang(i18n.resolvedLanguage || 'en-US');
      setOpen(true);
    }
  }, [lang]);

  return (
    <Modal
      open={open}
      title={t('translate:select_language', "Select Languate")}
      closeText={t('translate:close', "Close")}
      showClose={false}
      onClose={handleClose}
      showConfirm={false}
    >
      <div className="list">
        {
          Object.keys(languages).map((key) => {
            return (
              <div
                className={`list-item  justify-center ${current === key ? 'selected' : ''}`}

                key={key}
                onClick={onLngSelect.bind(null, key)}
              >
                {
                  (languages as any)[key]?.base?.name || ''
                }
                {/* <span className='text-sm'>{t(`language:${key || "-"}`)}</span>
                <span className='text-xs text-gray-600'>{(languages as any)[key].base.name || ''}</span> */}
              </div>
            )
          })
        }
      </div>
    </Modal>
  );
}
