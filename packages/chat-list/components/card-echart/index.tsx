import React, { useEffect, useRef, useState } from 'react';
import {
  Card,
  CardContent,
  CardTitle,
  CardActions,
  // RadioGroup,
} from "chat-list/components/ui/card";
import Button from '../button';
import sheetApi from '@api/sheet';
import { setChartEditValue } from 'chat-list/local/session';
import useChatState from 'chat-list/hook/useChatState';
import { Loader2 } from 'lucide-react';
import { renderEChart } from 'chat-list/utils/chart';

export interface ICardEchartProps {
  code: string;
  data: string[][];
  // option: EChartsOption;
  width?: number;
  height?: number;
  onError: (error: Error) => void;
  onRender?: (base64: string) => void;
}

const CHART_HEIGHT = 400;
const CHART_WIDTH = 600;

export default function CardEchart(props: ICardEchartProps) {
  const {
    code,
    data,
    onError,
    width = CHART_WIDTH,
    height = CHART_HEIGHT,
    onRender
  } = props;
  const chatState = useChatState();

  const [loading, setLoading] = useState(true);
  const img = useRef<HTMLImageElement>(null);

  const initFunc = (code: string) => {
    const fun = eval(`(function() {${code}; \n return createEchartOption;})`);
    return fun();
  };
  const excute = () => {
    setLoading(true);

    try {
      const fun = initFunc(code);
      const copy = JSON.parse(JSON.stringify(data));
      const option = fun(copy);
      const base64 = renderEChart(option);
      img.current.src = base64;
      setLoading(false);
    } catch (err) {
      onError && onError(err);
    }
  };
  const onInsertToSheet = async (
  ) => {
    // base64: string,
    // width: number,
    // height: number
    const base64 = img.current.src;
    // const rect = img.current.getBoundingClientRect();
    await sheetApi.insertImage(base64, width, height);
  };

  const onOpenInWindow = async () => {
    setChartEditValue({ data, code });
    if (chatState.platform === 'google') {
      await sheetApi.showModalDialog(
        'html/chart-edit',
        'Edit Chart'
      );
    } else {
      await sheetApi.showModalDialog(
        'html/chart-edit',
        'Edit Chart',
        700,
        600,
        async (event: {
          type: string;
          data: { imageData: string; width: number; height: number };
        }) => {
          if (event.type === 'save') {
            await sheetApi.insertImage(
              event.data.imageData,
              event.data.width,
              event.data.height
            );
          }
        }
      );
    }
  };

  useEffect(() => {
    excute();
  }, []);

  return (
    <Card className="w-card">
      <CardTitle>Add Chart (Powered by GPT)</CardTitle>
      <CardContent className="markdown flex flex-col justify-center items-center overflow-hidden">
        <div
          className="flex justify-center items-center "
          style={{
            height: 172,
            width: 256,
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
        </div>
        {/* <div className=" hidden">
          {option && (
            <ReactECharts
              ref={echartRef}
              option={{
                animation: false,
                backgroundColor: '#FFF',
                ...option,
              }}
              notMerge={true}
              lazyUpdate={true}
              // theme={'theme_name'}
              onChartReady={onChartReadyCallback}
              // onEvents={EventsDict}

              opts={{
                animation: false,
                devicePixelRatio: 2,
                width: width,
                height: 'auto',
              } as any}
            />
          )}
        </div> */}
        <p>
          Click on Ok to insert chart to current Sheet or Edit it in new window.
        </p>
      </CardContent>
      <CardActions>
        <Button
          action="translate-text"
          color="primary"
          onClick={onInsertToSheet}
        >
          Ok
        </Button>
        <Button
          action="select-range"
          color="primary"
          onClick={onOpenInWindow}
          title="Click to excute"
        >
          Edit In Window
        </Button>
      </CardActions>
    </Card>
  );
}
