import * as echarts from 'echarts';

interface ChartConfig {
    width?: string;
    height?: string;
    [key: string]: any;
}

interface DataItem {
    chartType?: string;
    name: string;
    values: number[];
    labels?: string[];
}

interface Options {
    title?: string;
    titleColor?: string;
    labelColor?: string;
}

export function renderEChart(chartConfig: ChartConfig): string {
    // console.log('chart config', chartConfig);
    const { width, height, ...config } = chartConfig;
    // 判断渲染节点是否存在，如果不存在则创建
    let chartContainer = document.getElementById('chart-container');
    if (!chartContainer) {
        chartContainer = document.createElement('div');
        // chartContainer.id = 'chart-container';
        chartContainer.style.position == 'fixed';
        chartContainer.style.left = '0px';
        chartContainer.style.top = '0px';
        chartContainer.style.width = width || '600px';
        chartContainer.style.height = height || '400px';
        chartContainer.style.zIndex = '10000';
        document.body.appendChild(chartContainer);
    }

    // 使用 ECharts 渲染图表
    const chart = echarts.init(chartContainer);

    // 设置图表配置信息
    const option = {
        backgroundColor: '#FFF',
        ...config,
        animation: false,
    };

    chart.setOption(option);

    // 图表渲染完成后获取图表数据，这里使用 base64 编码
    const base64Data = chart.getDataURL({
        pixelRatio: window.devicePixelRatio || 1,  // 设置像素比例，可根据需求调整
    });

    // 销毁图表
    chart.dispose();

    // 销毁渲染节点
    if (chartContainer.parentNode) {
        chartContainer.parentNode.removeChild(chartContainer);
    }

    // 返回图表 base64 数据
    return base64Data;
}
/*
export function generateEChartsOption(type: string, data: DataItem, options: Options = { title: '' }): echarts.EChartOption {
    // 提取所有的标签
    const labels = data.labels || [];

    // 基础配置
    const baseOption: echarts.EChartOption = {
        title: {
            text: data.name || '',
            left: 'center',
            textStyle: {
                color: options.titleColor || '#000' // 标题字体颜色
            }
        },
        legend: {
            data: data.name,
            top: '10%',
            textStyle: {
                color: options.labelColor || '#000' // 标签字体颜色
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: labels,
            axisLabel: {
                show: true,
                color: options.labelColor || '#000' // x轴标签字体颜色
            }
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                color: options.labelColor || '#000' // y轴标签字体颜色
            }
        },
        animation: false,
    };

    // 根据不同图表类型生成不同的系列配置
    const generateSeries = (): echarts.EChartOption.Series[] => {
        const commonConfig: echarts.EChartOption.Series = {
            name: data.name,
            type: type,
            data: data.values,
            emphasis: {
                focus: 'series'
            }
        };

        switch (type) {
            case 'line':
                return {
                    ...commonConfig,
                    smooth: true,
                    symbol: 'circle',
                    symbolSize: 8
                };
            case 'bar':
                return commonConfig;
            case 'pie':
                return {
                    name: data.name,
                    type: 'pie',
                    radius: '50%',
                    // 如果设置了高度，调整饼图大小以适应
                    center: ['50%', '50%'],
                    data: data.labels.map((label, index) => ({
                        name: label,
                        value: data.values[index]
                    })),
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                };
            case 'scatter':
                return {
                    ...commonConfig,
                    symbolSize: 10
                };
            case 'area':
                return {
                    ...commonConfig,
                    type: 'line',
                    areaStyle: {},
                    smooth: true
                };
            default:
                return commonConfig;
        }
    };

    // 特殊图表类型的配置调整
    const adjustConfigForChartType = (config: echarts.EChartOption): echarts.EChartOption => {
        switch (type) {
            case 'pie':
                config.xAxis = undefined;
                config.yAxis = undefined;
                config.tooltip = {
                    trigger: 'item',
                    formatter: '{a} <br/>{b}: {c} ({d}%)'
                };
                break;
            case 'scatter':
                config.tooltip.axisPointer = {
                    type: 'cross'
                };
                break;
            case 'area':
                config.tooltip.trigger = 'axis';
                break;
        }
        return config;
    };

    // 生成最终配置
    const finalOption = {
        ...baseOption,
        series: generateSeries()
    };

    // 返回经过图表类型调整的最终配置
    return adjustConfigForChartType(finalOption);
}

*/

export function generateEChartsOption(type: string, data: DataItem[], options: Options = { title: '' }): echarts.EChartOption {
    // 提取所有的标签
    const labels = data[0]?.labels || [];

    // 基础配置
    const baseOption: echarts.EChartOption = {
        title: {
            text: options.title || '',
            left: 'center',
            textStyle: {
                color: options.titleColor || '#000' // 标题字体颜色
            }
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        legend: {
            data: data.map(item => item.name),
            top: '10%',
            textStyle: {
                color: options.labelColor || '#000' // 标签字体颜色
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: labels,
            axisLabel: {
                color: options.labelColor || '#000' // x轴标签字体颜色
            }
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                color: options.labelColor || '#000' // y轴标签字体颜色
            }
        },
        animation: false,
    };

    // 根据不同图表类型生成不同的系列配置
    const generateSeries = (): echarts.EChartOption.Series[] => {
        return data.map(item => {
            const commonConfig: echarts.EChartOption.Series = {
                name: item.name,
                type: type,
                data: item.values,
                emphasis: {
                    focus: 'series'
                }
            };

            switch (type) {
                case 'line':
                    return {
                        ...commonConfig,
                        smooth: true,
                        symbol: 'circle',
                        symbolSize: 8
                    };
                case 'bar':
                    return commonConfig;
                case 'pie':
                    return {
                        name: item.name,
                        type: 'pie',
                        radius: '50%',
                        // 如果设置了高度，调整饼图大小以适应
                        center: ['50%', '50%'],
                        data: item.labels.map((label, index) => ({
                            name: label,
                            value: item.values[index]
                        })),
                        emphasis: {
                            itemStyle: {
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                            }
                        }
                    };
                case 'scatter':
                    return {
                        ...commonConfig,
                        symbolSize: 10
                    };
                case 'area':
                    return {
                        ...commonConfig,
                        type: 'line',
                        areaStyle: {},
                        smooth: true
                    };
                case 'radar':
                    return {
                        ...commonConfig,
                        type: 'radar',
                        data: item.values.map((value, index) => ({
                            value: value,
                            name: labels[index]
                        }))
                    };
                default:
                    return commonConfig;
            }
        });
    };

    // 特殊图表类型的配置调整
    const adjustConfigForChartType = (config: echarts.EChartOption): echarts.EChartOption => {
        switch (type) {
            case 'pie':
                config.xAxis = undefined;
                config.yAxis = undefined;
                config.tooltip = {
                    trigger: 'item',
                    formatter: '{a} <br/>{b}: {c} ({d}%)'
                };
                break;
            case 'scatter':
                config.tooltip.axisPointer = {
                    type: 'cross'
                };
                break;
            case 'area':
                config.tooltip.trigger = 'axis';
                break;
            case 'radar':
                config.xAxis = undefined;
                config.yAxis = undefined;
                config.tooltip = {
                    trigger: 'item'
                };
                config.radar = {
                    indicator: labels.map(label => ({ name: label }))
                };
                break;
        }
        return config;
    };

    // 生成最终配置
    const finalOption = {
        ...baseOption,
        series: generateSeries()
    };

    // 返回经过图表类型调整的最终配置
    return adjustConfigForChartType(finalOption);
}
