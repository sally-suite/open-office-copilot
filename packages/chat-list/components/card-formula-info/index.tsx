import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardTitle,
  // RadioGroup,
} from "chat-list/components/ui/card";
import Form, { FormulaInfo } from './form';
import sheetApi from '@api/sheet';
import { getHeaderList } from 'chat-list/service/sheet';
import Loading from '../loading';
import { numberToLetter, parseCellAddress } from 'chat-list/utils';
interface ICardFormulaInfoProps {
  onSubmit: (value: string) => void;
}

export default function CardFormulaInfo(props: ICardFormulaInfoProps) {
  const { onSubmit } = props;
  const [formValue, setFormValue] = useState<FormulaInfo>({});
  const [loading, setLoading] = useState(true);
  const init = async () => {
    setLoading(true);
    const heads = await getHeaderList();
    const dataRangeCells = await sheetApi.getRangeA1Notation();
    setFormValue({
      headers: heads.join(','),
      dataRangeCells,
      headerInDataRange: 'Yes'
    });
    setLoading(false);
  };
  const onSubmitForm = () => {
    const start = formValue.dataRangeCells.split(':')[0];
    const { column, row } = parseCellAddress(start);
    const headers = formValue.headers.split(',').map((h, i) => {
      const letter = numberToLetter(column + i);
      return `${h}<${letter}${row}>`;
    }).join(' , ');
    const content = `
Here is the information about data range:

1. DATA RANGE CELLS: ${formValue.dataRangeCells}
2. HEADER NAMES: ${headers}
3. HEADER IN DATA RANGE: ${formValue.headerInDataRange}`;
    onSubmit?.(content);
  };
  useEffect(() => {
    init();
  }, []);
  return (
    <Card className="w-full">
      <CardTitle>Forumla Context</CardTitle>
      <CardContent className=" flex flex-row flex-wrap justify-center">
        {
          loading && <Loading className=' h-28' />
        }
        {
          !loading && <Form value={formValue} onSubmit={onSubmitForm} />
        }
        <p>
          In order to better generate the function, the above information needs to be collected.
        </p>
      </CardContent>
    </Card>
  );
}
