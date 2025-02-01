import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardTitle,
  CardActions,
  // RadioGroup,
} from "chat-list/components/ui/card";
import sheetService from '@api/sheet';
import Markdown from 'chat-list/components/markdown';
import BubbleMenu from 'chat-list/components/bubble-menu';
interface ICardFormulaProps {
  content: string;
  expressoin: string;
}

export default function CardCreate(props: ICardFormulaProps) {
  const { content, expressoin } = props;
  const [value, setValue] = useState(expressoin || '');
  const [explain, setExplain] = useState(false);
  const handleApply = async () => {
    await sheetService.setFormula(value.replace('\n', ''));
  };
  const showExplain = () => {
    setExplain(!explain);
  };
  return (
    <Card className="w-full">
      <CardTitle>Add Formula</CardTitle>
      <CardContent className=" flex flex-row flex-wrap justify-center">
        {/* <Markdown copyContentBtn={false}>{content}</Markdown> */}
        <div className="markdown w-full mt-2">
          {/* <Input rows={2} value={value} onChange={(val) => setValue(val)} /> */}
          <pre className='bg-slate-700 p-1 rounded'>
            <code>
              {value}
            </code>
          </pre>

          <div className='flex flex-row justify-start items-center w-full cu'>
            <BubbleMenu content={value} className='' showCopyMark={false} />
          </div>
        </div>

        {
          explain && (
            <Markdown
              className="markdown w-full mt-2"
              copyCodeBtn={true}
              copyContentBtn={false}>
              {content}
            </Markdown>
          )
        }
        <div className=' text-blue-500 w-full cursor-pointer text-left ' onClick={showExplain}>
          {explain ? 'Hide' : 'Show'} Explanation
        </div>
      </CardContent>
      <CardActions>

      </CardActions>
    </Card>
  );
}
