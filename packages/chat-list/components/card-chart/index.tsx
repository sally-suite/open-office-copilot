import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardTitle,
  CardActions,
  // RadioGroup,
} from "chat-list/components/ui/card";
import { Input } from 'chat-list/components/ui/input'
import Button from '../button';
import sheetService from '@api/sheet';
import { getHeaderList } from 'chat-list/service/sheet';
import SelectList from '../select-list';
import { RadioGroup, RadioGroupItem } from 'chat-list/components/ui/radio-group';
import { CheckboxGroup } from 'chat-list/components/ui/checkbox'
import { ChartTypes } from 'chat-list/types/chart';
import Loading from 'chat-list/components/loading'
import useChatState from 'chat-list/hook/useChatState';
import { useTranslation } from 'react-i18next';

interface ICardFormatProps {
  autoAdd?: boolean;
  options: {
    address?: string;
    type: string;
    title?: string;
    xAxisTitle?: string;
    yAxisTitle?: string;
    yAxisTitles?: string[];
    position?: number[];
  };
}

const chartOptions = ChartTypes.map((name) => {
  return {
    value: name,
    label: `${name} Chart`,
  };
});

function CardChart(props: ICardFormatProps) {
  const { options, autoAdd = false } = props;
  const { type = 'Line', position = [1, 1], address } = options;
  const [chartType, setChartType] = useState(type);
  const { platform } = useChatState();
  const [titles, setTitles] = useState([]);
  const [xValue, setXValue] = useState(options.xAxisTitle || '');
  const [yValues, setYValues] = useState(options.yAxisTitles || []);
  const [title, setTitle] = useState(options.title || '');
  const [isStacked, setIsStacked] = useState<'false' | 'true'>('false');
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation(['chart']);
  const onAddChart = async () => {
    console.log(options)
    await sheetService.AddChart({
      address,
      type: chartType,
      title,
      xAxisTitle: xValue,
      yAxisTitle: '',
      yAxisTitles: yValues,
      isStack: isStacked === 'true',
      position
    });
  };
  const onSelectChart = (value: string) => {
    setChartType(value);
  };
  const initHeaders = async () => {
    setLoading(true);
    const list = await getHeaderList();
    setTitles(list.map((name) => {
      return {
        value: name,
        text: name
      }
    }));
    setLoading(false);
  };
  const onSelectX = (val: string) => {
    console.log(val)
    setXValue(val);
  };
  const onSelectY = (vals: string[]) => {
    console.log(vals)
    setYValues(vals);
  };
  const onTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };
  const onStackedChange = (val: 'true' | 'false') => {
    console.log(val)
    setIsStacked(val);
  };
  useEffect(() => {
    initHeaders();
  }, []);
  useEffect(() => {
    if (autoAdd) {
      sheetService.AddChart({
        address,
        type: chartType,
        title,
        xAxisTitle: xValue,
        yAxisTitle: '',
        yAxisTitles: yValues,
        isStack: isStacked === 'true',
        position
      });
    }
  }, []);
  return (
    <Card className=" w-card">
      <CardTitle>{title}</CardTitle>
      <CardContent className=" flex flex-col  justify-center">
        <h3 className="input-label">Chart Type:</h3>
        <div className='mb-2'>
          <SelectList
            placeholder="Select Chart"
            options={chartOptions}
            value={chartType}
            onChange={onSelectChart}
          />
        </div>
        <h3 className="input-label">X-axis:</h3>
        <div className='mb-2'>
          {loading && <Loading className='h-8' />}
          {!loading && (
            <RadioGroup className="flex flex-row" defaultValue={xValue} onValueChange={onSelectX}>
              {
                titles.map(({ value, text }) => {
                  return (
                    <div key={value} className="flex items-center">
                      <RadioGroupItem id={`x-${value}}`} value={value} />
                      <label
                        className="mx-1 cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        htmlFor={`x-${value}}`}>{text}</label>
                    </div>
                  )
                })
              }
            </RadioGroup>
          )}
        </div>
        <h3 className="input-label">Y-axis:</h3>
        <div className='mb-2'>
          {loading && <Loading className='h-8' />}
          {!loading && (
            <CheckboxGroup
              value={yValues}
              options={titles}
              onChange={onSelectY}
            />
          )}
        </div>
        {
          platform == 'google' && (
            <>
              <h3 className="input-label">Stacked:</h3>
              <div className='mb-2'>
                <RadioGroup className="flex flex-row" defaultValue={isStacked} onValueChange={onStackedChange}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="r1" />
                    <label htmlFor="r1">Yes</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="r2" />
                    <label htmlFor="r2">No</label>
                  </div>
                </RadioGroup>
              </div>
            </>
          )
        }

        <h3 className="input-label">Title:</h3>
        <div className='mb-2'>
          <Input
            value={title}
            onChange={onTitleChange}
            placeholder="Chart title"
          />
        </div>
      </CardContent>
      <CardActions>
        <Button action="create" color="primary" onClick={onAddChart}>
          {t('chart.create_chart')}
        </Button>
      </CardActions>
    </Card>
  );
}

export default React.memo(CardChart);
