
import { AddChart, getValuesByRange, getValues } from './sheet'

export async function testChart() {
    const width = 400;
    const height = 270;
    const gap = 20;

    const positions: number[][] = [];
    // 5 row and 3 column charts layout
    const rows = 5, cols = 3;
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            positions.push([j * (width + gap) + 100, i * (height + gap) + 100]);
        }
    }
    let current = 0;
    await AddChart('Bar', 'Sales', 'Sales', 'City', ['Sales'], false, positions[current++])
    await AddChart('Bar', 'Sales', 'Sales', 'City', ['Sales'], false, positions[current++])
    await AddChart('Bar', 'Sales', 'Sales', 'City', ['Sales'], false, positions[current++])
    await AddChart('Bar', 'Sales', 'Sales', 'City', ['Sales'], false, positions[current++])
    await AddChart('Bar', 'Sales', 'Sales', 'City', ['Sales'], false, positions[current++])
    await AddChart('Bar', 'Sales', 'Sales', 'City', ['Sales'], false, positions[current++])
}



export async function main() {
    const values = await getValuesByRange(1, 1, 2, 3);
    console.log(values)
}
