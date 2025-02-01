import React from "react";
import {
  Card,
  CardContent,
  CardTitle,
  CardFooter,
  // RadioGroup,
} from "chat-list/components/ui/card";
import Button from "../button";
import LanguageList from "chat-list/components/language-list";
import toast from "chat-list/components/ui/use-toast";
import useLocalStore from "chat-list/hook/useLocalStore";
import {
  SHEET_CHAT_FROM_LANG,
  SHEET_CHAT_TO_LANG,
  SHEET_CHAT_TRANSLATE_ENGINE,
  SHEET_CHAT_TRANSLATE_STYLE,
} from "chat-list/config/translate";
import TransStyleList from "../trans-style-list";
import { useTranslation } from 'react-i18next';
import { ArrowUpDown } from "lucide-react";

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
    engine: "google" | "gpt";
    style: string;
  }) => void;
}

export default React.memo(function CardTranslateSetting(props: ICardSettingProps) {
  const { title, description = "", onChange } = props;
  const { t } = useTranslation(['translate']);

  const { value: source, setValue: setSource } =
    useLocalStore<{ value: string, text: string }>(SHEET_CHAT_FROM_LANG);
  const { value: target, setValue: setTarget } =
    useLocalStore<{ value: string, text: string }>(SHEET_CHAT_TO_LANG);

  const { value: engine } = useLocalStore<"google" | "gpt">(
    SHEET_CHAT_TRANSLATE_ENGINE,
    "gpt"
  );

  const { value: style, setValue: setStyle } = useLocalStore<string>(
    SHEET_CHAT_TRANSLATE_STYLE,
    "Formal"
  );

  const onTranslateSet = async () => {
    if (!target) {
      toast.fail("Please select target language");
      return;
    }

    if (onChange) {
      await onChange({
        source,
        target,
        engine,
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

  const onSelectStyle = (value: string) => {
    setStyle(value);
  };

  const onExchange = () => {
    const from = source;
    setSource(target);
    setTarget(from);
  };
  return (
    <Card className=" w-full">
      <CardTitle>{t('translate_title', title) || ""}</CardTitle>
      <CardContent className=" w-card flex flex-col  justify-center text-sm">
        <p>{description}</p>
        <div>
          <h3 className="input-label">{t('from_language_label', 'From Language:')}</h3>
          <div className="flex flex-row items-center space-x-1">
            <LanguageList
              className="flex-1"
              value={source?.value}
              placeholder="Auto"
              onChange={onSelectSource}
            />
          </div>
          <div className="flex justify-start  my-2">
            <ArrowUpDown width={20} height={20} className="  cursor-pointer" onClick={onExchange} />
          </div>
          <h3 className="input-label">{t('to_language_label', 'To Language:')}</h3>
          <div className="flex flex-row items-center space-x-1">
            <LanguageList className="flex-1" value={target?.value} onChange={onSelectTarget} />
          </div>
          <h3 className="input-label">{t('tone_label', 'Tone:')}</h3>
          <TransStyleList value={style} onChange={onSelectStyle} />
        </div>
      </CardContent>
      <CardFooter>
        <Button
          action="translate-text"
          color="primary"
          onClick={onTranslateSet}
        >
          Ok
        </Button>
      </CardFooter>
    </Card>
  );
});