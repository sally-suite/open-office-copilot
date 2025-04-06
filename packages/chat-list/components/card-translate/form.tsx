import React, { useRef, useState } from "react";
import Button from "../button";
import LanguageList from "chat-list/components/language-list";
import toast from "chat-list/components/ui/use-toast";
import useLocalStore from "chat-list/hook/useLocalStore";
import {
  SHEET_CHAT_LANGUAGE_HISTORY,
  SHEET_CHAT_TRANSLATE_MODE,
} from "chat-list/config/translate";
import TransStyleList from "../trans-style-list";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { getValues } from 'chat-list/service/sheet';
import sheeApi from '@api/sheet';
import { useTranslation } from 'react-i18next';
import { Input } from "../ui/input";
import { extractJsonDataFromMd, isTwoDimensionalArray, template } from "chat-list/utils";
import useChatState from "chat-list/hook/useChatState";
import Progress from "../progress";
import transDataPrompt from './promps/translate.md';
import { X } from "lucide-react";

export function buildTransLateMessages(data: string[][], sourceLanguage: string, targetLanguage: string, style: string) {
  const tableData = JSON.stringify(data, null, 2);
  const prompt = template(transDataPrompt, {
    sourceLanguage,
    targetLanguage,
    style
  });
  const context = {
    role: 'system',
    content: prompt,
  };

  return [
    context,
    {
      role: 'user',
      content: `User input data :\n\`\`\`json\n${tableData}\n\`\`\``
    }];
}

export interface ICardSettingProps {
  targetLanguage: string,
  tone: string,
  sheetName: string,
  batchSize: number
}

const transModeOptions = [
  { label: "Overwrite", value: "overwrite" },
  { label: "New Sheet", value: "new-sheet" },
];

export default React.memo(function CardTranslateSetting(props: ICardSettingProps) {
  const context = useChatState();
  const { targetLanguage, tone, sheetName, batchSize = 3 } = props;
  const { t } = useTranslation(['translate']);
  const [rows, setRows] = useState(batchSize);

  const [target, setTarget] = useState(targetLanguage);

  const { value: mode, setValue: setMode } = useLocalStore<'overwrite' | 'new-sheet'>(
    SHEET_CHAT_TRANSLATE_MODE,
    "overwrite"
  );
  const { value: languageHistory, setValue: setLanguageHistory } =
    useLocalStore<Array<{ value: string, text: string }>>(SHEET_CHAT_LANGUAGE_HISTORY, []);

  const [style, setStyle] = useState(tone || "Formal");
  const [progress, setProgress] = useState(0);
  const running = useRef(false);

  const translateSheetByGpt = async (
    sourceLanguage: string,
    targetLanguage: string,
    mode?: 'overwrite' | 'new-sheet',
    style = 'Formal',
    sheetName = '',
    batch = 1
  ) => {
    setProgress(0);
    // const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const values = await getValues(0, sheetName);
    const { col, row, colNum, rowNum } = await sheeApi.getRowColNum();
    if (!values.length) {
      throw new Error(`I'm sorry, I can't deal with your request.`);
    }
    const name = 'Sheet' + (Math.random() * 100).toFixed(0);
    let isActive = false;
    for (let i = 0; i < values.length; i += batch) {
      if (!running.current) {
        break;
      }
      let realBatch = batch;
      if (i + batch >= values.length) {
        realBatch = values.length - i;
      }
      const rowData = values.slice(i, i + realBatch);

      const messages: any = buildTransLateMessages(
        rowData,
        sourceLanguage,
        targetLanguage,
        style || 'Formal'
      );
      const result = await context.chat({
        messages,
        temperature: 0.5,
      });
      const data = extractJsonDataFromMd(result.content);
      if (!data) {
        continue;
      }
      let value = data;
      if (!Array.isArray(data)) {
        if (Array.isArray(data.data)) {
          value = data.data;
        } else if (Array.isArray(data.translations)) {
          value = data.translations;
        } else {
          throw new Error(`I'm sorry, I can't deal with your request.`);
        }
      }
      console.log(value);

      if (isTwoDimensionalArray(value)) {
        if (!mode || mode == 'overwrite') {
          console.log(value, row + i, col, value.length, value[0].length);
          await sheeApi.setValuesByRange(value, row + i, col, value.length, value[0].length);
        } else {
          if (!isActive) {
            await sheeApi.initSheet(name, [], { active: true });
            isActive = true;
          }
          console.log(value, row + i, col, value.length, value[0].length);
          await sheeApi.setValuesByRange(value, row + i, col, value.length, value[0].length);
        }
      }
      if (i >= values.length) {
        setProgress(100);
      } else {
        setProgress(Math.floor((i + 1) / values.length * 100));
      }
    }
    if (progress < 100) {
      setProgress(100);
    }
  };

  const onTranslateSet = async () => {
    if (!target) {
      toast.fail("Please select target language");
      return;
    }
    running.current = true;
    await translateSheetByGpt(
      '',
      target,
      mode,
      style,
      sheetName,
      rows
    );

  };
  const onStop = () => {
    running.current = false;
  };

  const onSelectTarget = (value: string, text: string) => {
    setTarget(text);
    if (!languageHistory.some(lang => lang.value === value)) {
      setLanguageHistory([...languageHistory, { value, text }]);
    }
  };

  const onSelectStyle = (value: string, text: string) => {
    setStyle(text);
  };

  const onModeChanage = (val: string) => {
    setMode(val);
  };

  const onTargetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTarget(e.target.value);
  };
  const onStyleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStyle(e.target.value);
  };

  const onRowsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (Number(e.target.value) <= 0) {
      return 0;
    }
    setRows(Number(e.target.value));
  };
  const selectHistoryLanguage = async (lang: { value: string, text: string }) => {
    setTarget(lang.text);
    running.current = true;
    await translateSheetByGpt(
      '',
      lang.value,
      mode,
      style,
      sheetName,
      rows
    );
  };

  const removeLanguage = (valueToRemove: string) => {
    setLanguageHistory(languageHistory.filter(lang => lang.value !== valueToRemove));
  };
  return (
    <div className="flex flex-col mx-auto w-full">
      <div>
        <h3 className="input-label">{t('to_language_label', 'To Language:')}</h3>
        <div className="flex flex-row space-x-1">
          <Input className="flex-2" value={target} onChange={onTargetChange}></Input>
          <LanguageList className="flex-1" value={target} onChange={onSelectTarget} />
        </div>

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
                );
              })
            }
          </SelectContent>
        </Select>
        <h3 className="input-label">{t('tone_label', 'Tone:')}</h3>
        <div className="flex flex-row space-x-1">
          <Input className="flex-2" value={style} onChange={onStyleChange}></Input>
          <TransStyleList value={style} onChange={onSelectStyle} />
        </div>

        <h3 className="input-label">{t('translate_rows_per_batch', 'Translate rows per batch:')}</h3>
        <Input type="number" value={rows} onChange={onRowsChange}></Input>
      </div>
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

      {
        progress > 0 && (
          <Progress className="my-2" percentage={progress} />
        )
      }
      <div className='flex flex-row items-center mt-2 space-x-2'>
        <Button
          action="translate-text"
          variant="default"
          onClick={onTranslateSet}
        >
          {t('ok_button_text', 'Ok')}
        </Button>
        <Button
          action="translate-text"
          variant="secondary"
          onClick={onStop}
        >
          {t('stop', 'Stop')}
        </Button>
      </div>
    </div>
  );
});
