import React, { useEffect, useRef, useState } from 'react';
import {
  Card,
  CardContent,
  CardTitle,
  CardActions,
  // RadioGroup,
} from "chat-list/components/ui/card";
import Button from '../button';
import ReactECharts from 'echarts-for-react';
import useChatState from 'chat-list/hook/useChatState'
import { renderEChart } from 'chat-list/utils/chart';
import { StockData } from 'chat-list/types/stock';
import dayjs from 'dayjs';
// import dataJson from './data/data.json';
import { base64ToFile } from 'chat-list/utils';
import api from '@api/index';
import { cn } from 'chat-list/lib/utils';
import { Input } from '../ui/input';
import { buildChartOption } from 'chat-list/utils/stock';

export interface ICardEchartProps {
  stockCode?: string;
  data?: StockData[];
  timespan?: string;
  // indicator: string;
  // option: EChartsOption;
  width?: number;
  height?: number;
  onError?: (error: Error) => void;
  onRender?: (base64: string) => void;
}

const CHART_HEIGHT = 700;
const CHART_WIDTH = 500;
const PERIODS = ["Day", "Week", "Month"];

let CACHE: { [x: string]: any } = {};
export default function CardEchart(props: ICardEchartProps) {
  const {
    timespan,
    stockCode,
    data,
    onError,
    width = CHART_WIDTH,
    height = CHART_HEIGHT,
    onRender
  } = props;

  const { setFileList, setText } = useChatState();
  const echartRef = useRef(null);
  const instanceRef = useRef(null);
  const [option, setOption] = useState(null)
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(timespan || 'day');
  const [stockTicker, setStockTicker] = useState(stockCode || 'AAPL');
  const [error, setError] = useState('');
  const onChartReadyCallback = (instance: any) => {
    // console.log(instance)
    instanceRef.current = instance;
    // excute(instance);
    try {
      const base64 = renderEChart(option);
      // img.current.src = base64;
      if (onRender) {
        onRender(base64)
      }
      setLoading(false);
    } catch (err) {
      onError && onError(err);
    }
  }

  const onAnalyze = async () => {
    const base64 = instanceRef.current.getDataURL({
      pixelRatio: 1,  // 设置像素比例，可根据需求调整
    });
    // console.log(base64)
    const file = await base64ToFile(base64, 'stock chart')
    setFileList([file])
    setText('help me analyze indicator macd');
  }
  const onSelectPeriod = async (period: string) => {
    setPeriod(period)
    await loadPrice(period)
  }
  const loadPrice = async (period: string) => {
    setLoading(true);
    const prices = CACHE[period]
    if (prices && prices.length > 0) {
      const option = buildChartOption(prices);
      setOption(option)
    } else {
      const span: any = period.toLocaleLowerCase() || 'day';
      const result = await api.stockPrices({
        stockTicker: stockTicker,
        multiplier: 1,
        timespan: span,
        from: dayjs(new Date()).add(-100, span).format('YYYY-MM-DD'),
        to: dayjs(new Date()).format('YYYY-MM-DD')
      }) as StockData[];
      if (result.length <= 0) {
        setError('No price data found, please check that the ticker symbol is correct and that only stocks in the US market are available.')
        return;
      }
      CACHE[period] = result;
      const option = buildChartOption(result);
      setOption(option)
    }
    setLoading(false);
  }
  const onQuery = async () => {
    CACHE = {};
    setError('');
    await loadPrice(period)
  }
  const init = () => {
    if (!data || data.length <= 0) {
      return;
    }
    CACHE = {
      [period]: data
    }
    const option = buildChartOption(data);
    setOption(option)
  }
  useEffect(() => {
    // excute();
    init();
  }, []);

  return (
    <Card className="w-card">
      <CardTitle>Candlestick Chart</CardTitle>
      <CardContent className="markdown flex flex-col justify-center items-center overflow-hidden p-1">
        {/* <div
          className="flex justify-center items-center "
          style={{
            height: 500
            // width: 500,
          }}
        >
          {loading && <Loader2 className='rotate' />}
          <img
            style={{
              display: loading ? 'none' : 'block',
            }}
            ref={img}
            src=""
            alt=""
          />
        </div> */}
        <div className='flex flex-row items-center space-x-1 w-full px-2 my-1'>
          <Input className='flex-1' value={stockTicker} placeholder='Input stock ticker symbol' onChange={(e) => {
            setStockTicker(e.target.value)
          }}></Input>
          <Button className=' w-20' onClick={onQuery}>Ok</Button>
        </div>
        {
          error && (
            <p className='p-2'>
              {error}
            </p>
          )
        }
        {option && (
          <div className='h-[500px] w-full'>
            <ReactECharts
              ref={echartRef}
              option={{
                // animation: false,
                backgroundColor: '#FFF',
                ...option,
              }}
              notMerge={true}
              lazyUpdate={true}
              // theme={'theme_name'}
              onChartReady={onChartReadyCallback}
              // onEvents={EventsDict}

              opts={{
                // animation: false,
                devicePixelRatio: 2,
                // width: width,
                height: 500
              } as any}

            />
          </div>
        )}
        {
          option && (
            <div className='flex flex-row items-center justify-start h-10 space-x-1 w-full px-2'>
              {
                PERIODS.map((item) => {
                  return (
                    <Button loading={period == item && loading} variant='secondary' key={item} className={cn(
                      'bg-gray-100 hover:bg-gray-200',
                      period.toLowerCase() == item.toLowerCase() ? "bg-gray-300" : ""
                    )} onClick={onSelectPeriod.bind(null, item)}>
                      {item}
                    </Button>
                  )
                })
              }
            </div>
          )
        }

      </CardContent>
      <CardActions className='space-x-1 px-2'>
        {
          option && (
            <Button
              className='md:w-auto'
              action="select-range"
              color="primary"
              onClick={onAnalyze}
              title="Click to analyze chart"
            >
              Screenshot & Analysis
            </Button>
          )
        }
      </CardActions>
    </Card>
  );
}
