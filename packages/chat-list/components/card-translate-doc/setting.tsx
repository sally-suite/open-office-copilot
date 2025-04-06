import React from "react";
import {
  Card,
  CardContent,
  CardTitle,
  CardFooter,
  // RadioGroup,
} from "chat-list/components/ui/card";
import { Button } from "chat-list/components/ui/button";
import LanguageList from "chat-list/components/language-list";
import toast from "chat-list/components/ui/use-toast";
import useLocalStore from "chat-list/hook/useLocalStore";
import {
  SHEET_CHAT_TO_LANG,
  SHEET_CHAT_TRANSLATE_STYLE,
  SHEET_CHAT_LANGUAGE_HISTORY,
} from "chat-list/config/translate";
import TransStyleList from "../trans-style-list";
import { useTranslation } from 'react-i18next';
import { X } from "lucide-react";

export type ILangItem = {
  value: string;
  text: string;
};

export interface ICardSettingProps {
  title: string;
  description?: string | React.ReactNode;
  onChange: (result: {
    target: ILangItem;
    style: string;
  }) => void;
}

export default React.memo(function CardTranslateSetting(props: ICardSettingProps) {
  const { title, description = "", onChange } = props;
  const { t } = useTranslation(['translate', 'base', 'language']);

  const { value: target, setValue: setTarget } =
    useLocalStore<{ value: string, text: string }>(SHEET_CHAT_TO_LANG);
  const { value: languageHistory, setValue: setLanguageHistory } =
    useLocalStore<Array<{ value: string, text: string }>>(SHEET_CHAT_LANGUAGE_HISTORY, []);

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
        target,
        style,
      });
    }
  };

  const onSelectTarget = (value: string, text: string) => {
    setTarget({ value, text });
    // Add to history if not already present
    if (!languageHistory.some(lang => lang.value === value)) {
      setLanguageHistory([...languageHistory, { value, text }]);
    }
  };

  const onSelectStyle = (value: string) => {
    setStyle(value);
  };

  const selectHistoryLanguage = async (lang: { value: string, text: string }) => {
    setTarget(lang);

    if (onChange) {
      await onChange({
        target: lang,
        style,
      });
    }
  };

  const removeLanguage = (valueToRemove: string) => {
    setLanguageHistory(languageHistory.filter(lang => lang.value !== valueToRemove));
  };
  return (
    <Card className=" w-full">
      <CardTitle>{t('translate_title', title) || ""}</CardTitle>
      <CardContent className=" w-card flex flex-col  justify-center text-sm">
        <p>{description}</p>
        <div>
          <h3 className="input-label">{t('to_language_label', 'To Language:')}</h3>
          <div className="flex flex-row items-center space-x-1">
            <LanguageList className="flex-1" value={target?.value} onChange={onSelectTarget} />
          </div>
          <h3 className="input-label">{t('tone_label', 'Tone:')}</h3>
          <TransStyleList value={style} onChange={onSelectStyle} />
          {languageHistory.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {languageHistory.map((lang) => (
                <div key={lang.value} className="relative">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => selectHistoryLanguage(lang)}
                    className="px-3 h-8 bg-gray-100 rounded-md text-sm hover:bg-gray-200 pr-8"
                  >
                    {t(`language:${lang.value}`)}
                  </Button>
                  <div
                    onClick={() => removeLanguage(lang.value)}
                    className="absolute -top-1 -right-1 p-1 rounded-full opacity-50 bg-gray-400 hover:bg-gray-500 text-white cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          size="sm"
          color="primary"
          onClick={onTranslateSet}
          className="px-8"
        >
          {t(`base:common.confirm`)}
        </Button>
      </CardFooter>
    </Card>
  );
});