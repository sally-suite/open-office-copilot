/* eslint-disable react/no-children-prop */
import React from 'react';
import {
  Card,
  CardContent,
  // RadioGroup,
} from "chat-list/components/ui/card";
import { RadioGroup, RadioGroupItem } from 'chat-list/components/ui/radio-group';
import ReactMarkdown from 'react-markdown';
import indroduce from './indroduce.md';
import { template } from 'chat-list/utils';
import { getChartEngine } from 'chat-list/local/local';
import useLocalStore from '../../hook/useLocalStore';
import { SHEET_CHAT_CHART_ENGINE } from '../../config/chart';
import { ChartEngine, ChartEngines, ChartNames } from '../../types/chart';
export interface ICardChartIntroduceProps {
  onSetChartEngine?: (name: string) => void;
}

const isOffice = typeof Office !== 'undefined';
const nativeChart = isOffice ? 'office' : 'google';

const options = ChartEngines.filter((p) => {
  if (nativeChart == 'office' && p == 'google') {
    return false;
  } else if (nativeChart === 'google' && p === 'office') {
    return false;
  }
  return true;
}).map((value) => {
  return {
    value,
    label: ChartNames[value],
  };
});

export default React.memo(function CardSelectChartEngine(
  props: ICardChartIntroduceProps
) {
  const { onSetChartEngine } = props;
  const { value: chartEngine, setValue: setChartEngine } = useLocalStore(
    SHEET_CHAT_CHART_ENGINE,
    'google'
  );
  const handleModeChange = (value: ChartEngine) => {
    setChartEngine(value);
    onSetChartEngine?.(ChartNames[value]);
  };

  const currentEngine =
    getChartEngine() === 'echarts' ? 'ECharts' : ChartNames[nativeChart];
  return (
    <Card className="w-card">
      <CardContent className=" flex flex-col justify-center overflow-hidden">
        <ReactMarkdown
          className={`markdown`}
          children={template(indroduce, {
            NativeChat: ChartNames[nativeChart],
            currentEngine,
          })}
        />
        <label className="input-label">Chart Engine:</label>
        {/* <RadioGroup
          value={chartEngine}
          options={options}
          onChange={handleModeChange}
        /> */}
        <RadioGroup className="flex flex-row" defaultValue={chartEngine} onValueChange={handleModeChange}>
          {
            options.map(({ value, label }) => {
              return (
                <div key={value} className="flex items-center">
                  <RadioGroupItem id={`x-${value}}`} value={value} />
                  <label
                    className="mx-1 cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    htmlFor={`x-${value}}`}>{label}</label>
                </div>
              );
            })
          }
        </RadioGroup>
      </CardContent>
    </Card>
  );
});
