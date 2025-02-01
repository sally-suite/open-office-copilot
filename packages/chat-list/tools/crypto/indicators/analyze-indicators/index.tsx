
import description from './description.md'
import { ChatState, ITool } from 'chat-list/types/plugin';
import { IChatMessage } from 'chat-list/types/message';
import dayjs from 'dayjs'
import api from '@api/index'
import { StockData } from 'chat-list/types/stock';
import { base64ToFile, buildChatMessage } from 'chat-list/utils';
import { analyzeIndicator } from './util';
import { getLocalStore, setLocalStore } from 'chat-list/local/local';
import { renderEChart } from 'chat-list/utils/chart';
import image from 'chat-list/utils/image';
import { buildChartOption } from 'chat-list/utils/stock';

export const func = async ({ crypto_ticker, timespan, user_requirement, context }: { crypto_ticker: string, message: IChatMessage, timespan: string, user_requirement: string, context: ChatState }) => {
    const { appendMsg, setTyping, updateMsg } = context;
    let result: any;
    try {
        result = await api.stockPrices({
            stockTicker: `X:${crypto_ticker}`,
            multiplier: 1,
            timespan: timespan || 'day',
            from: dayjs(new Date()).add(-365, 'day').format('YYYY-MM-DD'),
            to: dayjs(new Date()).format('YYYY-MM-DD')
        }) as StockData[];
        if (result.length == 0) {
            return `Failed to request stock price data, confirm that the stock code ${crypto_ticker} is correct and retry!`
        }
    } catch (e) {
        return `Failed to request stock price data, confirm that the stock code ${crypto_ticker} is correct and retry!`
    }

    async function analyze(base64: string) {
        setTyping(true);

        const file = await base64ToFile(base64, 'stock_image');
        //`![${crypto_ticker}](${url})\n\n` +
        const url = image.set(base64, 'chart.crypto');
        const chartMsg = buildChatMessage(`Crypto Ticker: ${crypto_ticker}, Timespan: ${timespan}\n\n![${crypto_ticker}](${url})\n\n`, 'text', 'assistant');
        appendMsg(chartMsg);

        let resMsg = buildChatMessage('', 'text', 'assistant');
        let isAppend = false;
        await analyzeIndicator(file, user_requirement, (done, res) => {
            if (!res.content) {
                return;
            }
            const content = res.content;
            if (res.content) {
                if (!isAppend) {
                    resMsg.content = content
                    appendMsg(resMsg);
                    isAppend = true;
                } else {
                    resMsg.content = content
                    updateMsg(resMsg._id, resMsg)
                }
            }
            if (done) {
                if (res.content) {
                    resMsg.content = content
                    updateMsg(resMsg._id, resMsg)
                }
                isAppend = false;
                resMsg = buildChatMessage(content, 'text', 'assistant');
            }
        })
        return resMsg;
    }
    async function addToMyStock(code: string) {
        const list: string[] = await getLocalStore('my-crypto-list') || [];
        if (!list.includes(code)) {
            setLocalStore('my-crypto-list', list.concat(code))
        }
    }
    const option = buildChartOption(result, { zoom: false });
    const base64 = renderEChart(option)
    addToMyStock(crypto_ticker);

    const res = await analyze(base64);

    // const msg = buildChatMessage(
    //     <CardStockIndicator
    //         stockCode={stock_code}
    //         timespan={timespan}
    //         data={result}
    //         onError={function (error: Error): void {
    //             console.log(error)
    //         }}
    //     />,
    //     'card',
    //     'assistant'
    // )

    // appendMsg(msg);

    return res;
}
export default {
    type: 'function',
    name: 'analyze_crypto_indicators',
    description,
    parameters: {
        "type": "object",
        "properties": {
            "user_requirement": {
                "type": "string",
                "description": `requirement user input`
            },
            "crypto_ticker": {
                "type": "string",
                "description": `crypto ticker symbol, returns the ticker symbol of the currency pair entered by the user`
            },
            "timespan": {
                "type": "string",
                "description": `Time span of the indicator, including day,week,month,quarter,year, default values is day`
            }
        },
        "required": [
            "user_requirement",
            "crypto_ticker",
            "timespan"
        ]
    },
    func
} as unknown as ITool;

