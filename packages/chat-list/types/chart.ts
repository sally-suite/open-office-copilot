// export type ChartType = '';

export enum ChartType {
    // TIMELINE = 'Timeline',
    AREA = 'Area',
    BAR = 'Bar',
    BUBBLE = 'Bubble',
    // CANDLESTICK = 'Candlestick',
    COLUMN = 'Column',
    // COMBO = 'Combo',
    // GAUGE = 'Gauge',
    // GEO = 'Geo',
    HISTOGRAM = 'Histogram',
    RADAR = 'Radar',
    LINE = 'Line',
    // ORG = 'Org',
    PIE = 'Pie',
    SCATTER = 'Scatter',
    // SPARKLINE = 'Sparkline',
    // STEPPED_AREA = 'SteppedArea',
    // TABLE = 'Table',
    TREEMAP = 'Treemap',
    WATERFALL = 'Waterfall'
}

export const ChartTypes: string[] = Object.values(ChartType);

export const ChartTypeKeys: Record<string, string> = ChartTypes.reduce((pre, k) => {
    return {
        ...pre,
        [k]: `Charts.ChartType.${k.toUpperCase()}`
    };
}, {});

export enum ChartEngine {
    ECHARTS = 'echarts',
    GOOGLE = 'google',
    OFFICE = 'office'
}

export const ChartEngines = Object.values(ChartEngine);

export const ChartNames = {
    'echarts': "ECharts",
    'google': "Google Chart",
    'office': "Office Chart",
};