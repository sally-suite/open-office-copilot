import React, { useEffect, useRef, useState } from 'react';
import ReactECharts, { EChartsInstance } from 'echarts-for-react';
import { themes } from '../theme';
import { resizeImg } from 'chat-list/utils';

interface IPreviewProps {
  option: any;
  onRender?: (imageSrc: string) => void;
}
export function Preview(props: IPreviewProps) {
  const { option = {}, onRender } = props;
  const echartRef = useRef(null);
  const [currentTheme, setCurrentTheme] = useState(null);
  const onFinish = async () => {
    const echartInstance: EChartsInstance =
      echartRef.current.getEchartsInstance();
    // // then you can use any API of echarts.
    const base64 = echartInstance.getDataURL();
    const height = echartInstance.getHeight();
    const width = echartInstance.getWidth();
    // console.log(height);
    const newData: any = await resizeImg(base64, width, height);

    // img.current.src = newData;
    // (document.getElementById('preview-img') as HTMLImageElement).src = newData;
    onRender && onRender(newData);
  };
  const onSelectTheme = (theme: string) => {
    setCurrentTheme(theme);
    setTimeout(() => {
      onFinish();
    }, 1000);
  };
  // const onChartReadyCallback = (instance: EChartsInstance) => {
  //   // setLoading(false);
  //   // setTimeout(() => {
  //   drawImag();
  //   // }, 1000);
  // };
  // useEffect(() => {
  //   setTimeout(() => {
  //     init();
  //   }, 2000);
  // }, []);

  useEffect(() => {
    setTimeout(() => {
      onFinish();
    }, 1000);
  }, [option]);

  return (
    <div>
      {option && (
        <ReactECharts
          key={1}
          ref={echartRef}
          option={{
            backgroundColor: themes[currentTheme]?.backgroundColor || '#FFF',
            ...option,
          }}
          notMerge={true}
          lazyUpdate={true}
          theme={themes[currentTheme]}
          // onChartReady={onChartReadyCallback}
          onEvents={
            {
              // onchange: onChartReadyCallback,
              // rendered: onChartReadyCallback,
              // finished: onFinish,
            }
          }
          // onEvents={EventsDict}
          opts={{
            // devicePixelRatio: 1,
            width: 600,
            height: 'auto',
          }}
        />
      )}
      <div className="my-4 px-2">Themes:</div>
      <div className="flex items-center">
        {Object.keys(themes).map((theme) => {
          return (
            <button
              className={`px-4 py-1 mx-2 bg-gray-200 rounded-md text-smfont-medium ${
                currentTheme == theme ? ' bg-gray-500 text-white' : ''
              }`}
              key={theme}
              onClick={onSelectTheme.bind(null, theme)}
            >
              {theme}
            </button>
          );
        })}
      </div>
      <div className=" bg-red-500">
        <img id="preview-img" alt="" />
      </div>
    </div>
  );
}

export default React.memo(Preview);
