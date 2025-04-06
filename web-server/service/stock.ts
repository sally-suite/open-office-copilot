
const apiKey = "_CLrFMxQQBTlxZNpyUQ09K2pSjzqbuCb";
const testData = {
    "next_url": "https://api.polygon.io/v1/indicators/sma/AAPL?cursor=YWN0aXZlPXRydWUmZGF0ZT0yMDIxLTA0LTI1JmxpbWl0PTEmb3JkZXI9YXNjJnBhZ2VfbWFya2VyPUElN0M5YWRjMjY0ZTgyM2E1ZjBiOGUyNDc5YmZiOGE1YmYwNDVkYzU0YjgwMDcyMWE2YmI1ZjBjMjQwMjU4MjFmNGZiJnNvcnQ9dGlja2Vy",
    "request_id": "a47d1beb8c11b6ae897ab76cdbbf35a3",
    "results": {
        "underlying": {
            "aggregates": [
                {
                    "c": 75.0875,
                    "h": 75.15,
                    "l": 73.7975,
                    "n": 1,
                    "o": 74.06,
                    "t": 1577941200000,
                    "v": 135647456,
                    "vw": 74.6099
                },
                {
                    "c": 74.3575,
                    "h": 75.145,
                    "l": 74.125,
                    "n": 1,
                    "o": 74.2875,
                    "t": 1578027600000,
                    "v": 146535512,
                    "vw": 74.7026
                }
            ],
            "url": "https://api.polygon.io/v2/aggs/ticker/AAPL/range/1/day/2003-01-01/2022-07-25"
        },
        "values": [
            {
                "timestamp": 1517562000016,
                "value": 140.139
            }
        ]
    },
    "status": "OK"
};

export const getIndicator = async (indicator: 'sma' | 'ema' | 'macd' | 'rsi', stockTicker: string, timespan: 'day' | 'week' | 'month' | 'quarter' | 'year', window: number) => {
    const url = `https://api.polygon.io/v1/indicators/${indicator}/${stockTicker}?timespan=${timespan}&adjusted=true&window=${window}&series_type=close&limit=50&order=desc`
    const result = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`
        }
    });
    return result.json();
}

// export const getPrice = async (stockTicker: string,) => {
//     const url = `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers/${stockTicker}?apiKey=${apiKey}`;
//     const result = await fetch(url, {
//         method: 'GET',
//         headers: {
//             'Content-Type': 'application/json',
//             Authorization: `Bearer ${apiKey}`
//         }
//     });
//     return result.json();
// }

export const getPrice = async (stocksTicker: string, multiplier: number, timespan: 'day' | 'week' | 'month' | 'quarter' | 'year', from: string, to: string) => {
    const url = `https://api.polygon.io/v2/aggs/ticker/${stocksTicker}/range/${multiplier}/${timespan}/${from}/${to}?adjusted=true&sort=asc`;
    const result = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`
        }
    });
    return result.json();
}