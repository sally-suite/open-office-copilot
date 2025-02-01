import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardTitle,
  CardActions,
  // RadioGroup,
} from "chat-list/components/ui/card";
import Form, { FormulaInfo } from './form'
import sheetApi from '@api/sheet'
import { getHeaderList, getSheetInfo, getValues, getValuesByRange } from 'chat-list/service/sheet';
import Loading from '../loading';
import { arrayToMarkdownTable, columnNum2letter, numberToLetter, parseCellAddress } from 'chat-list/utils';
import Button from '../button';
import { useTranslation } from 'react-i18next'

interface ICardFormulaInfoProps {
  onSubmit: (value: string) => void;
}

export default function CardFormulaInfo(props: ICardFormulaInfoProps) {
  const { onSubmit } = props;
  const { t } = useTranslation(['sheet']);

  const [formValue, setFormValue] = useState<FormulaInfo>({});
  const [loading, setLoading] = useState(true)

  const onFormChange = (formValue: FormulaInfo) => {
    setFormValue(formValue)
  }
  const onSubmitForm = async () => {

    const content = await getSheetInfo();

    onSubmit?.(content);

  }

  return (
    <Card className="w-full">
      <CardTitle> {t('sheet.context.card_title', 'Confirm Context information')}</CardTitle>
      <CardContent className=" flex flex-row flex-wrap justify-center">
        <p dangerouslySetInnerHTML={{
          __html: t('sheet.context.description', '')
        }}>

        </p>
        <Form value={formValue} onChange={onFormChange} />
      </CardContent>
      <CardActions>
        <Button
          action="set-sheet-info"
          className='mt-2'
          onClick={onSubmitForm}
        >
          {t('sheet.context.update', '')}
        </Button>
      </CardActions>
    </Card>
  );
}
