import React from "react";
import {
  Card,
  CardContent,
  CardTitle,
  CardFooter,
} from "chat-list/components/ui/card";
import Button from "../button";
import LanguageList from "chat-list/components/language-list";
import toast from "chat-list/components/ui/use-toast";
import useLocalStore from "chat-list/hook/useLocalStore";
import {
  SHEET_CHAT_FROM_LANG,
  SHEET_CHAT_TO_LANG,
  SHEET_CHAT_TRANSLATE_ENGINE,
  SHEET_CHAT_TRANSLATE_MODE,
  SHEET_CHAT_TRANSLATE_STYLE,
  SHEET_CHAT_LANGUAGE_HISTORY,
} from "chat-list/config/translate";
import TransStyleList from "../trans-style-list";
import { ILangItem } from "types/translate";
import { X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useTranslation } from 'react-i18next';
import useChatState from "chat-list/hook/useChatState";

export interface ICardSettingProps {
  title: string;
  onChange: (result: {
    target: ILangItem;
    mode?: "overwrite" | "new-sheet";
    style: string;
  }) => void;
}

const engineOptions = [
  { label: "Google", value: "google" },
  { label: "GPT", value: "gpt" },
];

const transModeOptions = [
  { label: "Overwrite", value: "overwrite" },
  { label: "New Sheet", value: "new-sheet" },
];

export default function CardTranslateSetting(props: ICardSettingProps) {
  const { title, onChange } = props;
  const { t } = useTranslation(['translate']);
  const { platform } = useChatState();

  const { value: source, setValue: setSource } =
    useLocalStore<{ value: string, text: string }>(SHEET_CHAT_FROM_LANG);
  const { value: target, setValue: setTarget } =
    useLocalStore<{ value: string, text: string }>(SHEET_CHAT_TO_LANG);
  const { value: languageHistory, setValue: setLanguageHistory } =
    useLocalStore<Array<{ value: string, text: string }>>(SHEET_CHAT_LANGUAGE_HISTORY, []);

  const { value: engine, setValue: setEngine } = useLocalStore<"google" | "gpt">(
    SHEET_CHAT_TRANSLATE_ENGINE,
    "gpt"
  );

  const { value: mode, setValue: setMode } = useLocalStore<"overwrite" | "new-sheet">(
    SHEET_CHAT_TRANSLATE_MODE,
    "overwrite"
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
        target,
        engine,
        mode,
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

  const onSelectStyle = (value: string, text: string) => {
    setStyle(value);
  };

  const onModeChanage = (val: "overwrite" | "new-sheet") => {
    setMode(val);
  };

  const removeLanguage = (valueToRemove: string) => {
    setLanguageHistory(languageHistory.filter(lang => lang.value !== valueToRemove));
  };

  const selectHistoryLanguage = async (lang: { value: string, text: string }) => {
    setTarget(lang);
    if (onChange) {
      await onChange({
        target: lang,
        mode,
        style,
      });
    }
  };

  return (
    <Card className="w-card">
      <CardTitle>{t('translate_title', title) || ""}</CardTitle>
      <CardContent className="w-card flex flex-col justify-center">
        <div>
          <h3 className="input-label">{t('to_language_label', 'To Language:')}</h3>
          <LanguageList value={target?.value} onChange={onSelectTarget} />

          <h3 className="input-label">{t('operation_mode_label', 'Operation Mode:')}</h3>
          <Select
            value={mode}
            onValueChange={onModeChanage}
          >
            <SelectTrigger className="h-8 w-full">
              <SelectValue placeholder="" />
            </SelectTrigger>
            <SelectContent>
              {transModeOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

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
                    className="px-3 h-8 sm:w-auto bg-gray-100 rounded-md text-sm hover:bg-gray-200 pr-8"
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
          action="translate-text"
          color="primary"
          onClick={onTranslateSet}
        >
          {t('ok_button_text', 'Ok')}
        </Button>
      </CardFooter>
    </Card>
  );
}