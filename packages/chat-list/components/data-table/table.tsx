import { cn } from 'chat-list/lib/utils';
import { numberToLetter } from 'chat-list/utils';
import React, { useEffect, useImperativeHandle, useRef } from 'react';
import colors, { themes } from 'chat-list/data/templates/colors';

interface ITableProps {
    data: string[][];
    className?: string;
}

const TableComponent = ((props: ITableProps, ref: any) => {
    const {
        data,
        className,
    } = props;
    if (!data || data.length === 0) return null;

    const table = useRef<HTMLTableElement>(null);

    useEffect(() => {
        // setTableStyle(colors[0]);
    }, []);

    const calculateColSpan = (row: string[], colIndex: number) => {
        let colSpan = 1;
        for (let i = colIndex + 1; i < row.length; i++) {
            if (row[i] === "") {
                colSpan++;
            } else {
                break;
            }
        }
        return colSpan;
    };

    const calculateRowSpan = (data: string[][], rowIndex: number, colIndex: number) => {
        let rowSpan = 1;
        for (let i = rowIndex + 1; i < data.length; i++) {
            if (data[i][colIndex] === "") {
                rowSpan++;
            } else {
                break;
            }
        }
        return rowSpan;
    };

    const renderRow = (row: string[], rowIndex: number, isHeader = false) => {
        const {
            headerRowColor,
            headerFontColor,
            firstRowColor,
            secondRowColor,
        } = colors[0];

        return (
            <tr key={rowIndex} className="border-b border-[#e0e0e0]">
                <td
                    key={-1}
                    className="px-2 py-1 border border-[#e0e0e0] bg-[#f5f5f5]"
                    style={{
                        width: 26,
                        padding: '0 8px',
                        textAlign: 'center',
                    }}
                >
                    {rowIndex + 1}
                </td>
                {row.map((cell, colIndex) => {
                    if (cell === "") return null;

                    const colSpan = calculateColSpan(row, colIndex);
                    const rowSpan = 1;// calculateRowSpan(data, rowIndex, colIndex);
                    const backgroundColor = isHeader ? headerRowColor : rowIndex % 2 === 0 ? firstRowColor : secondRowColor;
                    const color = isHeader ? headerFontColor : undefined;

                    return (
                        <td
                            key={colIndex}
                            className="px-2 py-1 border border-[#e0e0e0]"
                            style={{
                                backgroundColor,
                                color,
                            }}
                            colSpan={colSpan}
                            rowSpan={rowSpan}
                        >
                            {cell}
                        </td>
                    );
                })}
            </tr>
        );
    };

    useImperativeHandle(ref, () => ({
        table: () => {
            return table.current;
        },
    }));

    return (
        <table ref={table} className={cn('w-full', className)}>
            <thead>
                <tr>
                    <td
                        key={-1}
                        className="py-1 border border-[#e0e0e0] "
                        style={{
                            height: 26,
                            width: 26,
                            textAlign: 'center',
                            margin: 0,
                            padding: '0 8px',
                        }}
                    ></td>
                    {data[0].map((_, cellIndex) => (
                        <td
                            key={cellIndex}
                            className="py-1 border border-[#e0e0e0] "
                            style={{
                                height: 16,
                                margin: 0,
                                padding: 0,
                                textAlign: 'center',
                            }}
                        >
                            {numberToLetter(cellIndex + 1)}
                        </td>
                    ))}
                </tr>
            </thead>
            <tbody>
                {data.map((row, index) => renderRow(row, index, false))}
            </tbody>
        </table>
    );
});

export default React.forwardRef(TableComponent);
