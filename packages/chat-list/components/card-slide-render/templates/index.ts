import temp1 from './temp1'
import temp2 from './temp2'
import temp3 from './temp3'
import temp4 from './temp4'
import temp5 from './temp5'
import temp6 from './temp6'
import temp7 from './temp7'
import temp8 from './temp8'
import temp9 from './temp9'

import table1 from './table1'
import table2 from './table2'
import table3 from './table3'
import table4 from './table4'



import chart1 from './chart1'
import { buildChartTpls as buildChartTplsForChart1 } from './chart1'
import chart2 from './chart2'
import { buildChartTpls as buildChartTplsForChart2 } from './chart2'
import chart3 from './chart3'


import cover1 from './cover1'
import cover2 from './cover2'
import cover3 from './cover3'
import catelog1 from './catelog1'
import catelog2 from './catelog2'
import overview from './overview'
import end from './end'
import { ISlideItem, Slide, Theme } from 'chat-list/types/api/slide'

export const templates = [cover1, catelog1, temp1, temp2, temp3, end]

export const covers = [cover1, cover2, cover3];

export const catalogs = [catelog1, catelog2];

export const ends = [end, end];

// export const slides = [temp1, temp2, temp3, temp4, temp5, temp6, temp7, temp8, temp9];
export const list = [temp1, temp2, temp3, temp4, temp5, temp6, temp7, temp8, temp9];

export const table = [table1, table2, table3, table4];

// const tpls1 = buildChartTplsForChart1()
// const tpls2 = buildChartTplsForChart2()
export const chart = [chart1, chart2, chart3];


export const overviews = [overview, overview];


export const getSlideTemplate = (type: string, addImage: boolean): ITemplate[] => {
    switch (type) {
        case 'cover':
            return covers.filter(p => addImage ? true : p.image == addImage)
        case 'catalog':
            return catalogs.filter(p => addImage ? true : p.image == addImage)
        case 'end':
            return ends.filter(p => addImage ? true : p.image == addImage)
        case 'list':
            return list.filter(p => addImage ? true : p.image == addImage)
        case 'table':
            return table;
        case 'chart':
            return chart;
        case 'overview':
            return overviews.filter(p => addImage ? true : p.image == addImage)
        default:
            return list.filter(p => addImage ? true : p.image == addImage)
    }
}

export interface ITemplate {
    render: (slideItem: ISlideItem, theme: Theme) => Promise<Slide>,
    name: string,
    image?: boolean,
    imageRatio?: number
}