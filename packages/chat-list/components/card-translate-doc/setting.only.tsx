import React from 'react';
import {
  Card,
  CardContent,
  CardTitle,
  CardActions,
  // RadioGroup,
} from "chat-list/components/ui/card";
import Button from '../button';
import LanguageList from 'chat-list/components/language-list';
import toast from "chat-list/components/ui/use-toast";
import useLocalStore from 'chat-list/hook/useLocalStore';
import {
  SHEET_CHAT_FROM_LANG,
  SHEET_CHAT_TO_LANG,
  SHEET_CHAT_TRANSLATE_STYLE,
} from 'chat-list/config/translate';
import TransStyleList from '../trans-box/trans-style-list';
import { useTranslation } from 'react-i18next'

import { ArrowUpDown } from 'lucide-react';

export type ILangItem = {
  value: string;
  text: string;
};

export interface ICardSettingProps {
  title: string;
  description?: string | React.ReactNode;
  onChange: (result: {
    source: ILangItem;
    target: ILangItem;
    engine?: 'google' | 'gpt';
    style: string;
  }) => void;
}

export default function CardTranslateSetting(props: ICardSettingProps) {
  const { title, description = '', onChange } = props;
  const { t } = useTranslation(['translate']);

  const { value: source, setValue: setSource } =
    useLocalStore(SHEET_CHAT_FROM_LANG);
  const { value: target, setValue: setTarget } =
    useLocalStore(SHEET_CHAT_TO_LANG);

  const { value: style, setValue: setStyle } = useLocalStore(
    SHEET_CHAT_TRANSLATE_STYLE,
    'Formal'
  );

  const onTranslateSet = async () => {
    if (!target) {
      toast.fail('Please select target language');
      return;
    }

    if (onChange) {
      await onChange({
        source,
        target,
        engine: 'gpt',
        style,
      });
    }
  };
  const onSelectSource = (value: string, text: string) => {
    setSource({ value, text });
  };
  const onSelectTarget = (value: string, text: string) => {
    setTarget({ value, text });
  };
  const onSelectStyle = (value: string, text: string) => {
    setStyle({ value, text });
  };

  const onExchange = () => {
    const from = source;
    setSource(target);
    setTarget(from);
  };
  return (
    <Card className=" w-card">
      <CardTitle>{t('translate_title', title) || ""}</CardTitle>
      <CardContent className=" w-card flex flex-col  justify-center">
        <p>{description}</p>
        <div>
          <h3 className="input-label">{t('from_language_label', 'From Language:')}</h3>
          <LanguageList
            value={source?.value}
            placeholder="Auto"
            onChange={onSelectSource}
          />
          <div className=" relative flex justify-center  mt-1 mb-1">
            <ArrowUpDown className=" absolute cursor-pointer top-1 right-0" onClick={onExchange} />

          </div>
          <h3 className="input-label">{t('to_language_label', 'To Language:')}</h3>
          <LanguageList value={target?.value} onChange={onSelectTarget} />
          <h3 className="input-label">{t('tone_label', 'Tone:')}</h3>
          <TransStyleList value={style?.value} onChange={onSelectStyle} />
        </div>
      </CardContent>
      <CardActions>
        <Button
          action="translate-text"
          color="primary"
          onClick={onTranslateSet}
        >
          Ok
        </Button>
      </CardActions>
    </Card>
  );
}
