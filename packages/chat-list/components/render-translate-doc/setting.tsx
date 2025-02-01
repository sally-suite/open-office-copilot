import React from "react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
  // RadioGroup,
} from "chat-list/components/ui/select";
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
  onChange: (result: {
    source: ILangItem;
    target: ILangItem;
    engine: "google" | "gpt";
    style: string;
  }) => void;
}
const engineOptions = [
  { label: "Google", value: "google" },
  { label: "GPT", value: "gpt" },
];

export default React.memo(function CardTranslateSetting(props: ICardSettingProps) {
  const { onChange } = props;
  const { t } = useTranslation(['translate']);

  const { value: source, setValue: setSource } =
    useLocalStore(SHEET_CHAT_FROM_LANG);
  const { value: target, setValue: setTarget } =
    useLocalStore(SHEET_CHAT_TO_LANG);

  const { value: engine, setValue: setEngine } = useLocalStore(
    SHEET_CHAT_TRANSLATE_ENGINE,
    "google"
  );

  const { value: style, setValue: setStyle } = useLocalStore(
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
  const onSelectStyle = (value: string, text: string) => {
    setStyle({ value, text });
  };
  const onEngineChanage = (val: string) => {
    setEngine(val);
  };
  const onExchange = () => {
    const from = source;
    setSource(target);
    setTarget(from);
  };
  return (
    <div className=" w-card flex flex-col  justify-center">
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
        <h3 className="input-label">{t('translate_engine_label', 'Translate Engine:')}</h3>
        <Select value={engine} onValueChange={onEngineChanage}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Theme" />
          </SelectTrigger>
          <SelectContent>
            {
              engineOptions.map((opt) => {
                return (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                );
              })
            }
          </SelectContent>
        </Select>
        <h3 className="input-label">{t('tone_label', 'Tone:')}</h3>
        <TransStyleList value={style?.value} onChange={onSelectStyle} />
      </div>
      <div className="mt-2">
        <Button
          action="translate-text"
          variant="default"
          onClick={onTranslateSet}
        >
          Ok
        </Button>
      </div>
    </div>


  );
});