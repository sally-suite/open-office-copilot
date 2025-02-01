import React, { useState } from "react";
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
  SHEET_CHAT_TRANSLATE_MODE,
  SHEET_CHAT_TRANSLATE_STYLE,
} from "chat-list/config/translate";
import TransStyleList from "../trans-style-list";
import { ILangItem } from "types/translate";
import { ArrowUpDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useTranslation } from 'react-i18next'
import useChatState from "chat-list/hook/useChatState";


export interface ICardSettingProps {
  title: string;
  onChange: (result: {
    source: ILangItem;
    target: ILangItem;
    engine: "google" | "gpt";
    mode: "overwrite" | "new-sheet";
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



export default React.memo(function CardTranslateSetting(props: ICardSettingProps) {
  const { title, onChange } = props;
  const { t } = useTranslation(['translate']);
  const { platform } = useChatState();
  const { value: source, setValue: setSource } =
    useLocalStore<{ value: string, text: string }>(SHEET_CHAT_FROM_LANG);
  const { value: target, setValue: setTarget } =
    useLocalStore<{ value: string, text: string }>(SHEET_CHAT_TO_LANG);

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
        source,
        target,
        engine,
        mode,
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
    setStyle(value);
  };
  const onEngineChanage = (val: "google" | "gpt") => {
    setEngine(val);
  };
  const onModeChanage = (val: "overwrite" | "new-sheet") => {
    setMode(val);
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
        <div>
          <h3 className="input-label">{t('from_language_label', 'From Language:')}</h3>
          <LanguageList
            value={source?.value}
            placeholder="Auto"
            onChange={onSelectSource}
          />
          <div className=" relative flex justify-center  mt-1 mb-1">
            {/* <Icon
              className=" absolute cursor-pointer top-1 right-0"
              style={{
                height: 20,
                width: 20,
              }}
              name="arrow_up_down"
              onClick={onExchange}
            /> */}
            <ArrowUpDown className=" absolute cursor-pointer top-1 right-0" onClick={onExchange} />
          </div>
          <h3 className="input-label">{t('to_language_label', 'To Language:')}</h3>
          <LanguageList value={target?.value} onChange={onSelectTarget} />
          {
            platform == 'google' && (
              <>
                <h3 className="input-label">{t('translate_engine_label', 'Translate Engine:')}</h3>
                <Select
                  value={engine}
                  onValueChange={onEngineChanage}
                >
                  <SelectTrigger className="h-8 w-full">
                    <SelectValue placeholder="" />
                  </SelectTrigger>
                  <SelectContent>
                    {
                      engineOptions.map((opt) => {
                        return (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        )
                      })
                    }
                  </SelectContent>
                </Select>
              </>
            )
          }
          <h3 className="input-label">{t('operation_mode_label', 'Operation Mode:')}</h3>
          <Select
            value={mode}
            onValueChange={onModeChanage}
          >
            <SelectTrigger className="h-8 w-full">
              <SelectValue placeholder="" />
            </SelectTrigger>
            <SelectContent>
              {
                transModeOptions.map((opt) => {
                  return (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  )
                })
              }
            </SelectContent>
          </Select>
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
          {t('ok_button_text', 'Ok')}
        </Button>
      </CardFooter>
    </Card>
  );
});
