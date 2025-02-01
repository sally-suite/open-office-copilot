import React, { useState } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

import { ILangItem } from "types/translate";
import { ArrowUpDown } from "lucide-react";
import { useTranslation } from 'react-i18next'
import { Input } from "../ui/input";


export interface ICardSettingProps {
  title: string;
  onChange: (result: {
    source: ILangItem;
    target: ILangItem;
    engine: "google" | "gpt";
    mode: "overwrite" | "new-sheet";
    style: string;
    batch: number;
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
  const [rows, setRows] = useState(3)
  const { value: source, setValue: setSource } =
    useLocalStore(SHEET_CHAT_FROM_LANG);
  const { value: target, setValue: setTarget } =
    useLocalStore(SHEET_CHAT_TO_LANG);

  const { value: engine, setValue: setEngine } = useLocalStore(
    SHEET_CHAT_TRANSLATE_ENGINE,
    "gpt"
  );

  const { value: mode, setValue: setMode } = useLocalStore(
    SHEET_CHAT_TRANSLATE_MODE,
    "overwrite"
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
        mode,
        style,
        batch: rows
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
  const onModeChanage = (val: string) => {
    setMode(val);
  };
  const onExchange = () => {
    const from = source;
    setSource(target);
    setTarget(from);
  };
  const onRowsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (Number(e.target.value) <= 0) {
      return 0;
    }
    setRows(Number(e.target.value))
  }
  return (
    <div className="p-2 flex flex-col mx-auto mt-2">
      <div>
        <h3 className="input-label">{t('from_language_label', 'From Language:')}</h3>
        <LanguageList
          value={source?.value}
          placeholder={t('auto_placeholder', 'Auto')}
          onChange={onSelectSource}
        />
        <div className=" relative flex justify-center  mt-1 mb-1">
          <ArrowUpDown className=" absolute w-5 h-5 cursor-pointer top-1 right-0 text-gray-500" onClick={onExchange} />
        </div>
        <h3 className="input-label">{t('to_language_label', 'To Language:')}</h3>
        <LanguageList value={target?.value} onChange={onSelectTarget} />
        {/* <h3 className="input-label">{t('translate_engine_label', 'Translate Engine:')}</h3>
        <Select className=" h-8"
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
        </Select> */}
        <h3 className="input-label">{t('operation_mode_label', 'Operation Mode:')}</h3>
        <Select className=" h-8"
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
                  <SelectItem
                    key={opt.value}
                    value={opt.value}
                  >
                    {t(`mode.${opt.value}`, opt.label)}
                  </SelectItem>
                )
              })
            }
          </SelectContent>
        </Select>
        <h3 className="input-label">{t('tone_label', 'Tone:')}</h3>
        <TransStyleList value={style?.value} onChange={onSelectStyle} />
        <h3 className="input-label">{t('translate_rows_per_batch', 'Translate rows per batch:')}</h3>
        <Input type="number" value={rows} onChange={onRowsChange}></Input>
      </div>
      <div className='flex flex-row items-center mt-2'>
        <Button
          action="translate-text"
          color="primary"
          onClick={onTranslateSet}
        >
          {t('ok_button_text', 'Ok')}
        </Button>
      </div>

    </div>
  );
});
