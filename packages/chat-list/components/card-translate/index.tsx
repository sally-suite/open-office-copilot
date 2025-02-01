import React, { } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  CardTitle,
  // RadioGroup,
} from "chat-list/components/ui/card";
import TranslateForm from './form';

interface ICardTranslateProps {
  targetLanguage: string,
  tone: string,
  sheetName: string,
  batchSize: number
}

export default function CardTranslate(props: ICardTranslateProps) {
  const { targetLanguage, tone, sheetName, batchSize } = props;
  const { t } = useTranslation(['translate']);

  return (
    <Card className=" w-card">
      <CardTitle>{t('translate_by_row', 'Translate by Row')}</CardTitle>
      <CardContent className=" w-card flex flex-col  justify-center">
        <TranslateForm targetLanguage={targetLanguage} tone={tone} sheetName={sheetName} batchSize={batchSize} />
      </CardContent>
    </Card>
  );
}
