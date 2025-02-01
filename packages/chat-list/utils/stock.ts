import { StockData } from "chat-list/types/stock";
import dayjs from 'dayjs';
const upColor = '#00da3c';
const downColor = '#ec0000';

export function calculateMA(dayCount: number, data: any) {
    const result = [];
    for (let i = 0, len = data.values.length; i < len; i++) {
        if (i < dayCount) {
            result.push('-');
            continue;
        }
        let sum = 0;
        for (let j = 0; j < dayCount; j++) {
            sum += data.values[i - j][1];
        }
        result.push(+(sum / dayCount).toFixed(3));
    }
    return result;
}
export function calculateEMA(prices: number[], days: number) {
    const k = 2 / (days + 1);
    const ema = [];
    ema[0] = prices[0];
    for (let i = 1; i < prices.length; i++) {
        ema[i] = prices[i] * k + ema[i - 1] * (1 - k);
    }
    return ema;
}
export function calculateMACD(prices: number[], shortDays: number, longDays: number, signalDays: number) {
    const shortEMA = calculateEMA(prices, shortDays);
    const longEMA = calculateEMA(prices, longDays);
    const macd = shortEMA.map((value, index) => value - longEMA[index]);
    const signal = calculateEMA(macd, signalDays);
    const histogram = macd.map((value, index) => value - signal[index]);
    return { macd, signal, histogram };
}
export function calculateRSI(prices: number[], period: number) {
    const rsi = [];
    for (let i = 0; i < prices.length; i++) {
        if (i < period) {
            rsi.push(0);
        } else {
            let gains = 0, losses = 0;
            for (let j = i - period + 1; j <= i; j++) {
                const change = prices[j] - prices[j - 1];
                if (change > 0) {
                    gains += change;
                } else {
                    losses -= change;
                }
            }
            const averageGain = gains / period;
            const averageLoss = losses / period;
            const rs = averageGain / averageLoss;
            rsi.push(100 - (100 / (1 + rs)));
        }
    }
    return rsi;
}

export function calculateKDJ(prices: number[], period: number) {
    const kdj: any = { K: [], D: [], J: [] };
    let k = 50, d = 50;
    for (let i = 0; i < prices.length; i++) {
        if (i < period) {
            kdj.K.push(50);
            kdj.D.push(50);
            kdj.J.push(50);
        } else {
            const high = Math.max(...prices.slice(i - period, i + 1));
            const low = Math.min(...prices.slice(i - period, i + 1));
            const rsv = (prices[i] - low) / (high - low) * 100;
            k = (2 / 3) * k + (1 / 3) * rsv;
            d = (2 / 3) * d + (1 / 3) * k;
            const j = 3 * k - 2 * d;
            kdj.K.push(k);
            kdj.D.push(d);
            kdj.J.push(j);
        }
    }
    return kdj;
}


export const buildChartOption = (stockData: StockData[] = [], options = { zoom: true }) => {
    const { zoom } = options;
    const categoryData = [];
    const values = [];
    const volumes = [];
    for (let i = 0; i < stockData.length; i++) {
        const item = stockData[i];
        categoryData.push(dayjs(item.t).format('YYYY-MM-DD'));
        values.push([item.o, item.c, item.l, item.h]);
        volumes.push([i, item.v, item.o > item.c ? 1 : -1]);
    }
    const data = {
        categoryData,
        values,
        volumes
    };
    const prices = values.map(item => item[1]);
    const { macd, signal, histogram } = calculateMACD(prices, 12, 26, 9);
    const rsi = calculateRSI(prices, 14);
    const kdj = calculateKDJ(prices, 9);
    // console.log(macd, signal, histogram)
    let techCharts: any[] = [{
        name: 'Volume',
        type: 'bar',
        xAxisIndex: 1,
        yAxisIndex: 1,
        data: data.volumes
    }];
    // if (indicator == 'macd') {
    techCharts = techCharts.concat([
        { name: 'MACD', type: 'line', data: macd, yAxisIndex: 2, xAxisIndex: 2, showSymbol: false, },
        { name: 'Signal', type: 'line', data: signal, yAxisIndex: 2, xAxisIndex: 2, showSymbol: false, },
        {
            name: 'Histogram', type: 'bar',
            // data: histogram,
            showSymbol: false,
            yAxisIndex: 2,
            xAxisIndex: 2,
            data: histogram.map((value, index) => ({
                value: value,
                itemStyle: {
                    color: value >= 0 ? 'green' : 'red'
                }
            })),
        }
    ]);
    // } else if (indicator == 'kdj') {
    techCharts = techCharts.concat([
        { name: 'K', type: 'line', data: kdj.K, yAxisIndex: 3, xAxisIndex: 3, showSymbol: false, },
        { name: 'D', type: 'line', data: kdj.D, yAxisIndex: 3, xAxisIndex: 3, showSymbol: false, },
        { name: 'J', type: 'line', data: kdj.J, yAxisIndex: 3, xAxisIndex: 3, showSymbol: false, }
    ]);
    // } else if (indicator === 'rsi') {
    techCharts = techCharts.concat([
        { name: 'RSI', type: 'line', data: rsi, yAxisIndex: 4, xAxisIndex: 4, showSymbol: false, },
        { name: 'Overbought', type: 'line', data: Array(prices.length).fill(70), yAxisIndex: 4, xAxisIndex: 4, showSymbol: false, lineStyle: { type: 'dashed', color: 'red', width: 1 } },
        { name: 'Oversold', type: 'line', data: Array(prices.length).fill(30), yAxisIndex: 4, xAxisIndex: 4, showSymbol: false, lineStyle: { type: 'dashed', color: 'green', width: 1 } }
    ]);
    // }
    const option = {
        animation: false,
        legend: {
            // top: '95%',
            bottom: 0,
            left: 'center',
            data: ['day', 'MA5', 'MA10', 'MA20', 'MA30']
        },
        axisPointer: {
            link: [
                {
                    xAxisIndex: 'all'
                }
            ],
            label: {
                backgroundColor: '#777'
            }
        },
        toolbox: {
            feature: {
                dataZoom: {
                    yAxisIndex: false
                },
                brush: {
                    type: ['lineX', 'clear']
                }
            }
        },
        brush: {
            xAxisIndex: 'all',
            brushLink: 'all',
            outOfBrush: {
                colorAlpha: 0.1
            }
        },
        visualMap: {
            show: false,
            seriesIndex: 5,
            dimension: 2,
            pieces: [
                {
                    value: 1,
                    color: downColor
                },
                {
                    value: -1,
                    color: upColor
                }
            ]
        },
        grid: [
            {
                left: '10%',
                right: '8%',
                height: '30%'
            },
            {
                left: '10%',
                right: '8%',
                top: '45%',
                height: '10%'
            },
            {
                left: '10%',
                right: '8%',
                top: '55%',
                height: '10%'
            }, {
                left: '10%',
                right: '8%',
                top: '65%',
                height: '10%'
            }, {
                left: '10%',
                right: '8%',
                top: '75%',
                height: '10%'
            },
        ],
        xAxis: [
            {
                type: 'category',
                data: data.categoryData,
                boundaryGap: false,
                axisLine: { onZero: false },
                splitLine: { show: false },
                min: 'dataMin',
                max: 'dataMax',
                axisPointer: {
                    z: 100
                }
            },
            {
                type: 'category',
                gridIndex: 1,
                data: data.categoryData,
                boundaryGap: false,
                axisLine: { onZero: false },
                axisTick: { show: false },
                splitLine: { show: false },
                axisLabel: { show: false },
                min: 'dataMin',
                max: 'dataMax'
            },
            {
                type: 'category',
                gridIndex: 2,
                data: data.categoryData,
                boundaryGap: false,
                axisLine: { onZero: false },
                axisTick: { show: false },
                splitLine: { show: false },
                axisLabel: { show: false },
                min: 'dataMin',
                max: 'dataMax'
            },
            {
                type: 'category',
                gridIndex: 3,
                data: data.categoryData,
                boundaryGap: false,
                axisLine: { onZero: false },
                axisTick: { show: false },
                splitLine: { show: false },
                axisLabel: { show: false },
                min: 'dataMin',
                max: 'dataMax'
            },
            {
                type: 'category',
                gridIndex: 4,
                data: data.categoryData,
                boundaryGap: false,
                axisLine: { onZero: false },
                axisTick: { show: false },
                splitLine: { show: false },
                axisLabel: { show: false },
                min: 'dataMin',
                max: 'dataMax'
            }
        ],
        yAxis: [
            {
                scale: true,
                splitArea: {
                    show: true
                }
            },
            {
                scale: true,
                gridIndex: 1,
                splitNumber: 2,
                axisLabel: { show: false },
                axisLine: { show: false },
                axisTick: { show: false },
                splitLine: { show: false }
            },
            {
                scale: true,
                gridIndex: 2,
                splitNumber: 2,
                axisLabel: { show: false },
                axisLine: { show: false },
                axisTick: { show: false },
                splitLine: { show: false }
            },
            {
                scale: true,
                gridIndex: 3,
                splitNumber: 2,
                axisLabel: { show: false },
                axisLine: { show: false },
                axisTick: { show: false },
                splitLine: { show: false }
            },
            {
                scale: true,
                gridIndex: 4,
                splitNumber: 2,
                axisLabel: { show: false },
                axisLine: { show: false },
                axisTick: { show: false },
                splitLine: { show: false }
            },
            // {
            //   scale: true,
            //   gridIndex: 5,
            //   splitNumber: 2,
            //   axisLabel: { show: false },
            //   axisLine: { show: false },
            //   axisTick: { show: false },
            //   splitLine: { show: false }
            // }
        ],
        dataZoom: [
            // {
            //     type: 'inside',
            //     xAxisIndex: [0, 1, 2, 3, 4],
            //     start: 20,
            //     end: 100
            // },
            {
                show: zoom,
                xAxisIndex: [0, 1, 2, 3, 4],
                type: 'slider',
                top: '86%',
                start: 40,
                end: 100
            }
        ],
        series: [
            {
                name: 'stock',
                type: 'candlestick',
                data: data.values,
                itemStyle: {
                    color: upColor,
                    color0: downColor,
                    borderColor: undefined,
                    borderColor0: undefined
                }
            },
            {
                name: 'MA5',
                type: 'line',
                showSymbol: false,
                data: calculateMA(5, data),
                smooth: true,
                // lineStyle: {
                //   opacity: 0.5
                // }
            },
            {
                name: 'MA10',
                type: 'line',
                showSymbol: false,
                data: calculateMA(10, data),
                smooth: true,
                // lineStyle: {
                //   opacity: 0.5
                // }
            },
            {
                name: 'MA20',
                type: 'line',
                showSymbol: false,
                data: calculateMA(20, data),
                smooth: true,
                // lineStyle: {
                //   opacity: 0.5
                // }
            },
            {
                name: 'MA30',
                type: 'line',
                showSymbol: false,
                data: calculateMA(30, data),
                smooth: true,
                // lineStyle: {
                //   opacity: 0.5
                // }
            },
            ...techCharts
        ]
    };
    return option;
};