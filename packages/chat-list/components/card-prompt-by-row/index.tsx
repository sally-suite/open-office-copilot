import React, { useContext, useEffect, useRef, useState } from 'react';
import { Textarea } from 'chat-list/components/ui/textarea';
import Button from 'chat-list/components/button';
import { getValuesByRange } from 'chat-list/service/sheet';
import Loading from '../loading';
import { useTranslation } from 'react-i18next';
import { ChatContext } from 'chat-list/store/chatContext';
import toast from '../ui/use-toast';
import sheetApi from '@api/sheet';
import {
  Card,
  CardContent,
  CardTitle,
  // RadioGroup,
} from "chat-list/components/ui/card";

import Progress from 'chat-list/components/progress';
import { IMessageBody } from 'chat-list/types/chat';
import { letter2columnNum } from 'chat-list/utils';
import { template } from 'chat-list/utils';
import { getValues } from 'chat-list/service/sheet';
// import { chatByPrompt } from 'chat-list/service/message';
import ColumnSelect from 'chat-list/components/column-select';
import Markdown from 'chat-list/components/markdown';
import { Info, XCircle } from 'lucide-react';
import useLocalStore from 'chat-list/hook/useLocalStore';
import { Alert, AlertDescription } from '../ui/alert';
import { getApiConfig } from 'chat-list/local/local';


interface ICardPrompByRowProps {
  requirements: string;
  column: string;
}


export const ApplyPromptByRowForm = (props: ICardPrompByRowProps) => {
  const { requirements, column } = props;
  const { chat } = useContext(ChatContext);
  const { t } = useTranslation(['intelligent']);
  const [inputValue, setInputValue] = useState(requirements);
  const [promptTemplate, setTemplate] = useState('');
  const [loading, setLoading] = useState(false);
  const [fillColumn, setFillColumn] = useState(column);
  const [progress, setProgress] = useState(0);
  const [rowData, setRowData] = useState([]);
  const [titles, setTitles] = useState([]);
  const [testResult, setTestResult] = useState('');
  const { value: showDesc, setValue: setShowDesc } = useLocalStore('sally-generate-prompt-by-row', true);
  const running = useRef(false);
  const buildTemplate = (titles: string[]) => {
    const content = titles.filter(p => p).map((title) => {
      return `${title}:\n{{${title}}}`;
    }).join('\n\n');

    const temp = `# User Requirement\n${inputValue || t('enter_requirement', "Enter your requirement.")}\n\n# Context Information\n${content}`;
    return temp;
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };
  const onColumnChange = (value: string) => {
    setFillColumn(value);
  };
  const onTemplateChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTemplate(e.target.value);
  };

  const buildPrompt = (rows: string[][], titles: string[]) => {
    const prompts = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const data = titles.reduce((pre, title, n) => {
        if (title == '') {
          return pre;
        }
        // return `[${title}]\n${row[n]}\n`
        return {
          ...pre,
          [title]: row[n]
        };
      }, {});
      const prompt = template(promptTemplate, {
        requirement: inputValue || t('enter_requirement', "Enter your requirement."),
        ...data
      });
      prompts.push(prompt);
    }
    return prompts;
  };
  const applyPromptByRow = async (requirements: string, column: string) => {
    setProgress(0);
    // const firtRow = await getValuesByRange('1:1');
    const values = await getValues();
    const { row, col, rowNum, colNum, } = await sheetApi.getRowColNum();
    const titles = values[0];
    const includeTitle = titles[0] == values[0][0];
    let rows = values;
    let startRow = row;
    if (includeTitle) {
      rows = values.slice(1);
      startRow = row + 1;
    }
    const prompts: string[] = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const data = titles.reduce((pre, title, n) => {
        if (title == '') {
          return pre;
        }
        // return `[${title}]\n${row[n]}\n`
        return {
          ...pre,
          [title]: row[n]
        };
      }, {});
      const prompt = template(promptTemplate, {
        requirement: requirements,
        ...data
      });
      prompts.push(prompt);
    }

    const columnNum = letter2columnNum(column) + 1;

    for (let m = 0; m < prompts.length; m++) {
      if (!running.current) {
        break;
      }
      const prompt = prompts[m];
      const messages: IMessageBody[] = [{
        role: 'user',
        content: prompt,
      }];
      const cellValue = await getValuesByRange(startRow + m, columnNum, 1, 1);
      if (cellValue[0][0]) {
        setProgress(Math.floor((m + 1) / prompts.length * 100));
        continue;
      }
      const { apiKey } = await getApiConfig();
      const { content } = await chat({
        messages,
        model: apiKey ? undefined : 'gpt-4o-mini'
      });
      // console.log('setValuesByRange', [[content]], startRow + m, columnNum, 1, 1)
      await sheetApi.setValuesByRange([[content]], startRow + m, columnNum, 1, 1);
      if (m >= prompts.length) {
        setProgress(100);
      } else {
        setProgress(Math.floor((m + 1) / prompts.length * 100));
      }
    }
  };

  const ask = async () => {
    // const titles = ['chunk', 'vector'];
    if (!fillColumn) {
      toast.show('Please input the column to which the result will be populated.');
      return;
    }
    running.current = true;
    await applyPromptByRow(inputValue, fillColumn);
  };
  const testPrompt = async () => {
    setTestResult('');
    const prompts = buildPrompt([rowData], titles);
    const prompt = prompts[0];
    const messages: IMessageBody[] = [{
      role: 'user',
      content: prompt,
    }];
    const { apiKey } = await getApiConfig();
    const { content } = await chat({
      messages,
      stream: false,
      model: apiKey ? undefined : 'gpt-4o-mini'
    });
    setTestResult(content);
  };
  const renderPreview = () => {

    const prompts = buildPrompt([rowData], titles);
    return prompts[0];
  };
  const stop = () => {
    // TODO
    running.current = false;
  };
  const onClose = () => {
    setShowDesc(false);
  };
  const init = async () => {
    // const titles = ['chunk', 'vector'];
    setLoading(true);
    const values = await getValues(2);
    const titles = values[0];
    const firtRow = values?.[1] || [];
    const temp = buildTemplate(titles);
    setTemplate(temp);
    setRowData(firtRow);
    setTitles(titles);
    setLoading(false);
  };
  useEffect(() => {
    init();
  }, []);
  return (
    <div className=" w-full flex flex-col h-full p-1">
      <div className="flex flex-col ">
        {
          loading && (
            <Loading className='h-20' text={t('loading_info', 'Building prompt template information')} />
          )
        }
        {
          !loading && (
            <>
              {
                showDesc && (
                  // <div className=' relative'>
                  //   <p className='pb-2 text-sm'>{t('template_desc', "This is a prompt template constructed from the table's column information, and we'll generate results by row.")}</p>
                  //   <XCircle height={16} width={16} className=' absolute bottom-0 right-0 cursor-pointer ' onClick={onClose} />
                  // </div>
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription className=' relative'>
                      {t('template_desc', "This is a prompt template constructed from the table's column information, and we'll generate results by row.")}
                      <XCircle height={16} width={16} className=' text-gray-500 absolute top-0 right-0 cursor-pointer ' onClick={onClose} />
                    </AlertDescription>
                  </Alert>
                )
              }

              <h3 className='input-label flex flex-row items-center justify-between'>
                {t('prompt_template', "Prompt template :")}
                <Button
                  className=' w-20'
                  onClick={init}
                  loading={loading}
                  variant='secondary'
                  size={'sm'}
                >
                  {t('refresh', 'Refresh')}
                </Button>
              </h3>
              <Textarea
                rows={6}
                value={promptTemplate}
                onChange={onTemplateChange}
                className="border p-2 mt-2"
              />

            </>

          )
        }
        <div className=' flex-1 p-1 sm:border-l'>
          <h3 className='input-label'>{t('prompt_preview', "Prompt Preview")}</h3>
          <pre className='max-h-28 overflow-auto bg-gray-100 p-2 rounded-md text-sm whitespace-pre-wrap'>
            {renderPreview()}
          </pre>
          <div className='flex flex-row items-center space-x-1'>
            <Button
              className='mt-2'
              onClick={testPrompt}
            >
              {t('test_prompt', 'Test Prompt')}
            </Button>
          </div>
          {
            testResult && (
              <Markdown>
                {testResult}
              </Markdown>
            )
          }
        </div>

        <h3 className='input-label'>{t('column_label', "Populate the result into this column:")}</h3>
        {/* <Input value={fillColumn} placeholder={t('column_placeholder', "Letter column label, such as: H")} onChange={onColumnChange} /> */}
        <ColumnSelect value={fillColumn} placeholder={t('column_placeholder', "Letter column label, such as: H")} onChange={onColumnChange} />

        {/* <h3 className='input-label'>{t('requirement', "Requirement:")}</h3>
          <Textarea
            rows={4}
            value={inputValue}
            onChange={handleInputChange}
            className="border p-2 mt-2"
            placeholder={t('enter_requirement', "Enter your requirement.")}
          /> */}
        {
          progress > 0 && (
            <Progress className="my-2" percentage={progress} />
          )
        }
      </div >
      <div className='flex flex-row items-center space-x-1'>
        <Button
          className='mt-2'
          onClick={ask}
        >
          {t('send', 'Send')}
        </Button>
        <Button
          className='mt-2'
          variant='secondary'
          onClick={stop}
        >
          {t('stop', 'Stop')}
        </Button>
      </div>
    </div>
  );
};
export default function CardPrompt(props: ICardPrompByRowProps) {
  const { requirements, column } = props;
  const { t } = useTranslation(['intelligent']);

  return (
    <Card className=" w-card">
      <CardTitle>{t('card_title', 'Apply Prompt by Row')}</CardTitle>
      <CardContent className=" w-card flex flex-col  justify-center">
        <ApplyPromptByRowForm requirements={requirements} column={column} />
      </CardContent>
    </Card>
  );
}
